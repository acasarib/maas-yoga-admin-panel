/**
 * Servicio de integración con AFIP para facturación electrónica.
 * Usa la librería `afip` (https://www.npmjs.com/package/afip).
 *
 * Tipos de comprobante soportados:
 *   1 → Factura A (Responsable Inscripto)
 *   6 → Factura B (Consumidor Final)
 *
 * Condiciones IVA del alumno:
 *   CONSUMIDOR_FINAL      → Factura B, DocTipo 99, DocNro 0
 *   RESPONSABLE_INSCRIPTO → Factura A, DocTipo 80, DocNro = CUIT del alumno
 */

import { createRequire } from "module";
import fs from "fs";
import { student, payment } from "../db/index.js";

const require = createRequire(import.meta.url);
const Afip = require("afip");

const INVOICE_TYPES = {
  CONSUMIDOR_FINAL: { cbte: 6, label: "Factura B", docTipo: 99 },
  RESPONSABLE_INSCRIPTO: { cbte: 1, label: "Factura A", docTipo: 80 },
};

let _afip = null;

const getAfip = () => {
  if (_afip) return _afip;

  const certPath = process.env.AFIP_CERT_PATH;
  const keyPath = process.env.AFIP_KEY_PATH;
  const cuit = process.env.AFIP_CUIT;

  if (!certPath || !keyPath || !cuit) {
    throw new Error("AFIP no configurado: faltan AFIP_CUIT, AFIP_CERT_PATH o AFIP_KEY_PATH en .env");
  }

  if (!fs.existsSync(certPath)) throw new Error(`Certificado AFIP no encontrado: ${certPath}`);
  if (!fs.existsSync(keyPath)) throw new Error(`Clave privada AFIP no encontrada: ${keyPath}`);

  _afip = new Afip({
    CUIT: parseInt(cuit),
    cert: fs.readFileSync(certPath).toString(),
    privateKey: fs.readFileSync(keyPath).toString(),
    production: process.env.AFIP_ENV === "production",
  });

  return _afip;
};

/**
 * Determina el tipo de factura a emitir en base a la condición IVA del alumno.
 */
const getInvoiceConfig = (ivaCondition, cuit) => {
  const config = INVOICE_TYPES[ivaCondition] || INVOICE_TYPES.CONSUMIDOR_FINAL;
  return {
    cbteTipo: config.cbte,
    label: config.label,
    docTipo: config.docTipo,
    docNro: ivaCondition === "RESPONSABLE_INSCRIPTO" && cuit ? parseInt(cuit.replace(/\D/g, "")) : 0,
  };
};

/**
 * Emite una factura electrónica en AFIP para un pago de alumno.
 * @param {number} paymentId - ID del pago en la DB
 * @returns {object} { cae, caeVencimiento, invoiceNumber, invoiceType }
 */
export const emitirFactura = async (paymentId) => {
  const afip = getAfip();
  const puntoVenta = parseInt(process.env.AFIP_PUNTO_VENTA || "1");

  const paymentDb = await payment.findByPk(paymentId, {
    include: [{ model: student }],
  });

  if (!paymentDb) throw new Error(`Pago ${paymentId} no encontrado`);

  const alumno = paymentDb.student;
  const ivaCondition = alumno?.ivaCondition || "CONSUMIDOR_FINAL";
  const { cbteTipo, label, docTipo, docNro } = getInvoiceConfig(ivaCondition, alumno?.cuit);

  const valor = parseFloat(paymentDb.value) || 0;
  const descuento = parseFloat(paymentDb.discount) || 0;
  const total = parseFloat((valor - (valor * descuento) / 100).toFixed(2));

  const ultimoComprobante = await afip.ElectronicBilling.getLastVoucher(puntoVenta, cbteTipo);
  const nroComprobante = ultimoComprobante + 1;

  const hoy = new Date();
  const fechaCbte = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}${String(hoy.getDate()).padStart(2, "0")}`;

  const data = {
    CantReg: 1,
    PtoVta: puntoVenta,
    CbteTipo: cbteTipo,
    Concepto: 2,
    DocTipo: docTipo,
    DocNro: docNro,
    CbteDesde: nroComprobante,
    CbteHasta: nroComprobante,
    CbteFch: parseInt(fechaCbte),
    ImpTotal: total,
    ImpTotConc: 0,
    ImpNeto: total,
    ImpOpEx: 0,
    ImpIVA: 0,
    ImpTrib: 0,
    MonId: "PES",
    MonCotiz: 1,
  };

  const result = await afip.ElectronicBilling.createVoucher(data);

  const caeVencimiento = result.CAEFchVto
    ? `${result.CAEFchVto.substring(0, 4)}-${result.CAEFchVto.substring(4, 6)}-${result.CAEFchVto.substring(6, 8)}`
    : null;

  await paymentDb.update({
    cae: result.CAE,
    caeVencimiento,
    invoiceNumber: nroComprobante,
    invoiceType: label,
  });

  console.log(`✅ Factura emitida: ${label} N° ${nroComprobante} | CAE: ${result.CAE} | Pago: ${paymentId}`);

  return {
    cae: result.CAE,
    caeVencimiento,
    invoiceNumber: nroComprobante,
    invoiceType: label,
  };
};

/**
 * Indica si un tipo de pago debe generar factura electrónica.
 * Efectivo y PayPal quedan excluidos.
 */
export const requiresInvoice = (paymentType) => {
  const INVOICEABLE = ["Mercado pago", "Transferencia", "Tarjeta de credito", "Débito de cuenta", "Débito de tarjeta"];
  return INVOICEABLE.includes(paymentType);
};
