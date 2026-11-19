import { payment, student, invoice, invoiceItem, item, category, sequelize, creditNote, creditNoteItem } from "../db/index.js";
import { editById as editStudentById } from "./studentService.js";
import { emitirFactura as afipEmitirFactura, emitirNotaCredito as afipEmitirNotaCredito, DOC_TIPO } from "./afipService.js";
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

export class InvalidCreditNoteItemError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidCreditNoteItemError";
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

/**
 * Suma, por invoiceItem, cuánto ya se acreditó en notas de crédito previas. Se usa tanto
 * para mostrar el saldo acreditable en el modal como para validar al emitir una NC nueva.
 */
const getCreditedAmountsByInvoiceItem = async (invoiceItemIds) => {
  if (invoiceItemIds.length === 0) return new Map();
  const rows = await creditNoteItem.findAll({
    where: { invoiceItemId: invoiceItemIds },
    attributes: ["invoiceItemId", [sequelize.fn("SUM", sequelize.col("amount")), "credited"]],
    group: ["invoiceItemId"],
    raw: true,
  });
  return new Map(rows.map((r) => [r.invoiceItemId, parseFloat(r.credited) || 0]));
};

/**
 * Resuelve la factura asociada a un pago junto con el saldo acreditable de cada ítem y las
 * notas de crédito ya emitidas — lo que necesita el modal de "Anular / Nota de Crédito".
 */
export const getInvoiceDetailForPayment = async (paymentId) => {
  const resolved = await resolveInvoiceForPayment(paymentId);
  if (!resolved || !resolved.invoiceDb) return null;
  const { invoiceDb } = resolved;

  const invoiceItemIds = invoiceDb.invoiceItems.map((i) => i.id);
  const creditedMap = await getCreditedAmountsByInvoiceItem(invoiceItemIds);

  const creditNotesDb = await creditNote.findAll({ where: { invoiceId: invoiceDb.id }, order: [["id", "DESC"]] });

  return {
    invoiceId: invoiceDb.id,
    invoiceType: invoiceDb.invoiceType,
    invoiceNumber: invoiceDb.invoiceNumber,
    puntoVenta: invoiceDb.puntoVenta,
    items: invoiceDb.invoiceItems.map((i) => {
      const credited = creditedMap.get(i.id) || 0;
      return { id: i.id, concept: i.concept, amount: i.amount, credited, remaining: parseFloat((i.amount - credited).toFixed(2)) };
    }),
    creditNotes: creditNotesDb.map((c) => ({
      id: c.id, creditNoteType: c.creditNoteType, creditNoteNumber: c.creditNoteNumber,
      cae: c.cae, totalAmount: c.totalAmount, reason: c.reason, createdAt: c.createdAt,
    })),
  };
};

/**
 * Emite una Nota de Crédito AFIP asociada a una factura ya emitida, para anular total o
 * parcialmente sus ítems. No modifica los `payment` originales — es una corrección fiscal;
 * la plata ya recibida sigue contando en balance / ingresos de profesores (decisión de
 * producto confirmada con el usuario).
 */
export const emitirNotaCreditoParaFactura = async ({ invoiceId, items, reason, userId }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new InvalidCreditNoteItemError("Se necesita al menos un ítem para emitir la nota de crédito");
  }

  const invoiceDb = await invoice.findByPk(invoiceId, { include: [{ model: invoiceItem }] });
  if (!invoiceDb) throw new Error("Factura no encontrada");

  const normalizedItems = items.map((it) => ({
    invoiceItemId: parseInt(it.invoiceItemId),
    concept: (it.concept || "").trim() || "Servicio",
    amount: parseFloat(it.amount),
  }));

  const invalidItem = normalizedItems.find((it) => !it.invoiceItemId || !it.amount || it.amount <= 0);
  if (invalidItem) {
    throw new InvalidCreditNoteItemError(`El monto del ítem ${invalidItem.invoiceItemId || "?"} debe ser un número mayor a 0`);
  }

  const invoiceItemsById = new Map(invoiceDb.invoiceItems.map((i) => [i.id, i]));
  const unknownItem = normalizedItems.find((it) => !invoiceItemsById.has(it.invoiceItemId));
  if (unknownItem) {
    throw new InvalidCreditNoteItemError(`El ítem ${unknownItem.invoiceItemId} no pertenece a esta factura`);
  }

  const creditedMap = await getCreditedAmountsByInvoiceItem([...invoiceItemsById.keys()]);
  for (const it of normalizedItems) {
    const original = invoiceItemsById.get(it.invoiceItemId);
    const alreadyCredited = creditedMap.get(it.invoiceItemId) || 0;
    const remaining = parseFloat((original.amount - alreadyCredited).toFixed(2));
    if (it.amount > remaining + 0.01) {
      throw new InvalidCreditNoteItemError(
        `El ítem "${original.concept}" solo tiene $${remaining.toFixed(2)} disponibles para acreditar`
      );
    }
  }

  const docTipo = invoiceDb.docType ? DOC_TIPO[invoiceDb.docType] : DOC_TIPO.SIN_IDENTIFICAR;
  const docNro = invoiceDb.docNumber ? parseInt(invoiceDb.docNumber) : 0;

  const afipResult = await afipEmitirNotaCredito({
    items: normalizedItems,
    ivaCondition: invoiceDb.ivaCondition || "CONSUMIDOR_FINAL",
    puntoVenta: invoiceDb.puntoVenta,
    invoiceNumber: invoiceDb.invoiceNumber,
    docTipo,
    docNro,
  });
  if (!afipResult) {
    throw new Error("La facturación AFIP no está disponible (certificados no configurados)");
  }
  const { cae, caeVencimiento, creditNoteNumber, creditNoteType, total } = afipResult;

  const { creditNoteDb, creditNoteItemsDb } = await sequelize.transaction(async (transaction) => {
    const creditNoteDb = await creditNote.create({
      invoiceId: invoiceDb.id,
      creditNoteType,
      creditNoteNumber,
      puntoVenta: invoiceDb.puntoVenta,
      cae,
      caeVencimiento,
      totalAmount: total,
      reason: (reason || "").trim() || null,
      createdByUserId: userId || null,
    }, { transaction });

    const creditNoteItemsDb = await creditNoteItem.bulkCreate(
      normalizedItems.map((it) => ({
        creditNoteId: creditNoteDb.id,
        invoiceItemId: it.invoiceItemId,
        concept: it.concept,
        amount: it.amount,
      })),
      { transaction }
    );

    return { creditNoteDb, creditNoteItemsDb };
  });

  logger.log(`✅ Nota de crédito creada: creditNoteId=${creditNoteDb.id} | invoiceId=${invoiceDb.id} | total=${total}`);

  return {
    creditNoteId: creditNoteDb.id,
    cae,
    caeVencimiento,
    creditNoteNumber,
    creditNoteType,
    totalAmount: total,
    items: creditNoteItemsDb.map((i) => ({ invoiceItemId: i.invoiceItemId, concept: i.concept, amount: i.amount })),
  };
};

/**
 * Resuelve una nota de crédito ya emitida (con su factura y alumno asociados) para
 * regenerar el PDF o reenviarla por email.
 */
export const resolveCreditNoteById = async (creditNoteId) => {
  const creditNoteDb = await creditNote.findByPk(creditNoteId, {
    include: [{ model: creditNoteItem }, { model: invoice, include: [{ model: student }] }],
  });
  if (!creditNoteDb) return null;
  return {
    creditNoteDb,
    invoiceDb: creditNoteDb.invoice,
    items: creditNoteDb.creditNoteItems.map((i) => ({ concept: i.concept, amount: i.amount })),
    total: creditNoteDb.totalAmount,
  };
};
