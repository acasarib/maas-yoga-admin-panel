import { payment, student, invoice, invoiceItem, item, category, sequelize } from "../db/index.js";
import { editById as editStudentById } from "./studentService.js";
import { emitirFactura as afipEmitirFactura } from "./afipService.js";
import logger from "../utils/logger.js";

export class MixedStudentsError extends Error {
  constructor() {
    super("Los movimientos seleccionados corresponden a alumnos distintos");
    this.name = "MixedStudentsError";
  }
}

export class DuplicateInvoiceError extends Error {
  constructor(alreadyInvoicedPaymentIds) {
    super("Algunos movimientos ya tienen una factura emitida");
    this.name = "DuplicateInvoiceError";
    this.alreadyInvoicedPaymentIds = alreadyInvoicedPaymentIds;
  }
}

export const normalizeItems = (items) => items.map((item) => ({
  paymentId: parseInt(item.paymentId),
  concept: (item.concept || "").trim() || "Servicio",
  amount: parseFloat(item.amount),
}));

export const findInvalidAmountItem = (normalizedItems) =>
  normalizedItems.find((item) => !item.paymentId || !item.amount || item.amount <= 0) || null;

/**
 * Valida que un conjunto de payments (ya resueltos desde la DB) pertenezcan todos al mismo
 * alumno, y que ese alumno coincida con el studentId declarado (evita IDOR: no confiamos en
 * el studentId que manda el frontend). Devuelve el studentId resuelto o lanza MixedStudentsError.
 */
export const resolveSameStudentId = (paymentsForValidation, studentId) => {
  const distinctStudentIds = new Set(paymentsForValidation.map((p) => p.studentId));
  if (distinctStudentIds.size > 1 || (studentId && !distinctStudentIds.has(parseInt(studentId)))) {
    throw new MixedStudentsError();
  }
  return [...distinctStudentIds][0];
};

export const findAlreadyInvoicedIds = (paymentsForValidation) =>
  paymentsForValidation.filter((p) => p.cae).map((p) => p.id);

/**
 * Emite una factura AFIP que agrupa uno o más movimientos (payments) del mismo alumno,
 * cada uno como un ítem con su propio concepto y monto, y persiste el resultado en
 * `invoice` + `invoiceItem`. Ver sdd/wip/001-afip-facturacion-multi-movimiento-monto.
 */
export const emitirFacturaAgrupada = async ({ items, studentId, ivaCondition, cuit, docType, document, confirmDuplicates = false, userId }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Se necesita al menos un movimiento para emitir la factura");
  }

  const normalizedItems = normalizeItems(items);
  const invalidItem = findInvalidAmountItem(normalizedItems);
  if (invalidItem) {
    throw new Error(`El monto del movimiento ${invalidItem.paymentId || "?"} debe ser un número mayor a 0`);
  }

  const paymentIds = normalizedItems.map((item) => item.paymentId);
  const paymentsDb = await payment.findAll({ where: { id: paymentIds } });
  if (paymentsDb.length !== paymentIds.length) {
    throw new Error("Alguno de los movimientos seleccionados no existe");
  }

  const missingStudent = paymentsDb.find((p) => !p.studentId);
  if (missingStudent) {
    throw new Error(`El movimiento ${missingStudent.id} no está asociado a un alumno`);
  }

  const resolvedStudentId = resolveSameStudentId(paymentsDb, studentId);

  const alreadyInvoicedPaymentIds = findAlreadyInvoicedIds(paymentsDb);
  if (alreadyInvoicedPaymentIds.length > 0 && !confirmDuplicates) {
    throw new DuplicateInvoiceError(alreadyInvoicedPaymentIds);
  }

  if (ivaCondition !== undefined || cuit !== undefined || document !== undefined) {
    const updateData = {};
    if (ivaCondition !== undefined) updateData.ivaCondition = ivaCondition || null;
    if (cuit !== undefined) updateData.cuit = cuit || null;
    if (document !== undefined) updateData.document = document ? String(document).replace(/\D/g, "") || null : null;
    if (Object.keys(updateData).length > 0) await editStudentById(updateData, resolvedStudentId);
  }

  const alumno = await student.findByPk(resolvedStudentId);

  // docType solo aplica a Factura B (ver resolveReceptorDoc en afipService.js) — para Factura A
  // (Responsable Inscripto) siempre se usa el CUIT del alumno, sin importar lo que llegue acá.
  const afipResult = await afipEmitirFactura({
    items: normalizedItems,
    ivaCondition: alumno?.ivaCondition || "CONSUMIDOR_FINAL",
    cuit: alumno?.cuit,
    docType,
    document: alumno?.document,
  });
  if (!afipResult) {
    throw new Error("La facturación AFIP no está disponible (certificados no configurados)");
  }
  const { cae, caeVencimiento, invoiceNumber, invoiceType, total } = afipResult;

  const isResponsableInscripto = alumno?.ivaCondition === "RESPONSABLE_INSCRIPTO";
  const invoiceDocType = isResponsableInscripto ? "CUIT" : (docType || null);
  const invoiceDocNumber = isResponsableInscripto
    ? (alumno?.cuit || null)
    : (docType === "DNI" ? alumno?.document : docType === "CUIT" || docType === "CUIL" ? alumno?.cuit : null) || null;

  const { invoiceDb, invoiceItemsDb } = await sequelize.transaction(async (transaction) => {
    const invoiceDb = await invoice.create({
      invoiceType,
      invoiceNumber,
      puntoVenta: parseInt(process.env.AFIP_PUNTO_VENTA || "1"),
      cae,
      caeVencimiento,
      totalAmount: total,
      studentId: alumno.id,
      ivaCondition: alumno.ivaCondition,
      cuit: alumno.cuit,
      docType: invoiceDocType,
      docNumber: invoiceDocNumber ? String(invoiceDocNumber) : null,
      createdByUserId: userId || null,
    }, { transaction });

    const invoiceItemsDb = await invoiceItem.bulkCreate(
      normalizedItems.map((item) => ({
        invoiceId: invoiceDb.id,
        paymentId: item.paymentId,
        concept: item.concept,
        amount: item.amount,
      })),
      { transaction }
    );

    await payment.update(
      { cae, caeVencimiento, invoiceNumber, invoiceType },
      { where: { id: paymentIds }, transaction }
    );

    return { invoiceDb, invoiceItemsDb };
  });

  logger.log(`✅ Factura agrupada creada: invoiceId=${invoiceDb.id} | pagos=[${paymentIds.join(", ")}] | total=${total}`);

  return {
    invoiceId: invoiceDb.id,
    cae,
    caeVencimiento,
    invoiceNumber,
    invoiceType,
    totalAmount: total,
    items: invoiceItemsDb.map((i) => ({ paymentId: i.paymentId, concept: i.concept, amount: i.amount })),
  };
};

/**
 * Resuelve los ítems (concepto + monto) de la factura a la que pertenece un payment,
 * para regenerar el PDF/email sin importar cuál de los movimientos agrupados se use.
 * Incluye fallback para facturas emitidas antes de existir `invoiceItem` (un solo ítem
 * reconstruido desde el propio `payment`).
 */
export const resolveInvoiceForPayment = async (paymentId) => {
  const paymentDb = await payment.findByPk(paymentId, { include: [{ model: student }, { model: item, include: [category] }] });
  if (!paymentDb) return null;
  if (!paymentDb.cae) return { paymentDb, invoiceDb: null, items: null };

  const latestInvoiceItem = await invoiceItem.findOne({ where: { paymentId: paymentDb.id }, order: [["id", "DESC"]] });
  if (!latestInvoiceItem) {
    const itemDesc = paymentDb.item?.category?.name || paymentDb.item?.name || paymentDb.note || "Servicio";
    const valor = parseFloat(paymentDb.value) || 0;
    const descuento = parseFloat(paymentDb.discount) || 0;
    const total = parseFloat((valor - (valor * descuento) / 100).toFixed(2));
    return { paymentDb, invoiceDb: null, items: [{ concept: itemDesc, amount: total }], total };
  }

  const invoiceDb = await invoice.findByPk(latestInvoiceItem.invoiceId, { include: [{ model: invoiceItem }] });
  return {
    paymentDb,
    invoiceDb,
    items: invoiceDb.invoiceItems.map((i) => ({ concept: i.concept, amount: i.amount })),
    total: invoiceDb.totalAmount,
  };
};
