import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rellena un template PDF de recibo de pago con los datos indicados.
 *
 * @param {Object} fields - Datos para completar el recibo.
 * @param {string} [fields.from] - Nombre completo del pagador (opcional).
 * @param {string} fields.date - Fecha del recibo en formato DD/MM/YYYY.
 * @param {string} fields.description - Descripción del pago.
 * @param {string} fields.paymentType - Medio de pago (ej: Efectivo, Transferencia, etc).
 * @param {string} fields.price - Importe del ítem (formateado, ej: "$1.000").
 * @param {number} [fields.discount] - Porcentaje de descuento (opcional).
 * @param {string} [fields.discountValue] - Valor descontado (formateado, opcional).
 * @param {string} fields.total - Total a pagar (formateado, ej: "$1.000").
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function fillPaymentReceiptPDF(fields) {
  const templatePath = path.resolve(__dirname, "../templates/payment_receipt.pdf");
  let templateBytes;
  try {
    templateBytes = fs.readFileSync(templatePath);
  } catch (err) {
    console.error("Error leyendo el template PDF:", err);
    throw err;
  }
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];
  let tableFontSize = 12;
  let priceColumnX = 465;
  let firstColumnStartAt = 70;

  // // Luego dibuja el texto encima
  page.drawText(fields.from || "", {
    x: 79, y: 604, size: 11, font, color: rgb(0,0,0)
  });

  page.drawText(fields.date || "", {
    x: 430, y: 620, size: 14, font, color: rgb(0,0,0)
  });

  page.drawText("DESCRIPCIÓN", {
    x: firstColumnStartAt, y: 485, size: tableFontSize, font, color: rgb(1,1,1)
  });
  let description = fields.description || "";
  let splitChars = 35;
  if (description.length > splitChars) {
    const firstLine = description.slice(0, splitChars);
    const secondLine = description.slice(splitChars);
    page.drawText(firstLine, {
      x: firstColumnStartAt, y: 455, size: tableFontSize, font, color: rgb(0,0,0)
    });
    if (secondLine) {
      page.drawText(secondLine, {
        x: firstColumnStartAt, y: 445, size: tableFontSize, font, color: rgb(0,0,0)
      });
    }
  } else {
    page.drawText(description, {
      x: firstColumnStartAt, y: 450, size: tableFontSize, font: await pdfDoc.embedFont(StandardFonts.Helvetica), color: rgb(0,0,0)
    });
  }

  page.drawText("MEDIO", {
    x: 320, y: 485, size: tableFontSize, font, color: rgb(1,1,1)
  });

  page.drawText(fields.paymentType || "", {
    x: 320, y: 450, size: tableFontSize, font, color: rgb(0,0,0)
  });

  page.drawText("PRECIO", {
    x: priceColumnX, y: 485, size: tableFontSize, font, color: rgb(1,1,1)
  });

  page.drawText(fields.price || "", {
    x: priceColumnX, y: 450, size: tableFontSize, font, color: rgb(0,0,0)
  });

  page.drawText(fields.total || "", {
    x: priceColumnX, y: 258, size: tableFontSize, font, color: rgb(0,0,0)
  });

  if (fields.discount) {
    page.drawText(`DESCUENTO: ${fields.discount}%`, {
      x: firstColumnStartAt, y: 405, size: tableFontSize, font, color: rgb(0,0,0)
    });

    page.drawText(fields.discountValue || "", {
      x: priceColumnX, y: 405, size: tableFontSize, font, color: rgb(0,0,0)
    });
  }

  return await pdfDoc.save();
}

/**
 * Genera un PDF de factura AFIP con layout oficial (RG 4291/2018) + QR reglamentario.
 * @param {Object} data
 * @returns {Promise<Buffer>}
 */
export async function generateAfipInvoicePDF(data) {
  const {
    invoiceType, invoiceNumber, puntoVenta, fechaCbte, fechaIso,
    emisorCuit, emisorNombre,
    receptorNombre, receptorCuit, receptorIva,
    items, total,
    cae, caeVencimiento,
    tipoCmp, tipoDocRec, nroDocRec,
  } = data;

  // --- QR AFIP (RG 4291) ---
  const cuitNum = parseInt((emisorCuit || '').replace(/-/g, '')) || 0;
  const docRecNum = parseInt((receptorCuit || '').replace(/-/g, '')) || 0;
  const qrPayload = {
    ver: 1, fecha: fechaIso || '', cuit: cuitNum,
    ptoVta: puntoVenta || 1, tipoCmp: tipoCmp || 6,
    nroCmp: invoiceNumber || 0, importe: total || 0,
    moneda: 'PES', ctz: 1,
    tipoDocRec: tipoDocRec || 99, nroDocRec: docRecNum,
    tipoCodAut: 'E', codAut: parseInt(cae) || 0,
  };
  const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${Buffer.from(JSON.stringify(qrPayload)).toString('base64')}`;
  const qrPngBuffer = await QRCode.toBuffer(qrUrl, { type: 'png', width: 130, margin: 1 });

  // --- PDF setup ---
  const pdfDoc = await PDFDocument.create();
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595, 842]);
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);

  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const gray = rgb(0.85, 0.85, 0.85);
  const lightGray = rgb(0.96, 0.96, 0.96);
  const dark = rgb(0.1, 0.1, 0.1);

  const L = 30;  // left margin
  const R = 565; // right edge
  const W = 535; // content width

  const fmt = (n) => n != null
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
    : '';

  const invoiceLetter = (invoiceType || '').includes('A') ? 'A' : 'B';
  const nroFmt = `${String(puntoVenta || 1).padStart(4, '0')}-${String(invoiceNumber || 0).padStart(8, '0')}`;
  const tipoCmpFmt = String(tipoCmp || 6).padStart(2, '0');

  // ================================================================
  // HEADER – 3 columns
  // ================================================================
  const hY = 755;  // bottom of header box
  const hH = 90;   // header height
  const lW = 220;  // left col width
  const cW = 55;   // center col width
  const rW = W - lW - cW; // right col width = 260

  // Left column (emitter)
  page.drawRectangle({ x: L, y: hY, width: lW, height: hH, borderColor: black, borderWidth: 0.5, color: white });
  page.drawText('Razon Social:', { x: L+5, y: hY+hH-14, size: 8, font: fontBold, color: dark });
  const nombre = (emisorNombre || 'Emisor').substring(0, 30);
  page.drawText(nombre, { x: L+5, y: hY+hH-26, size: 9, font: fontBold, color: dark });
  page.drawText('Condicion IVA Emisor:', { x: L+5, y: hY+hH-40, size: 7, font: fontReg, color: dark });
  page.drawText('Responsable Inscripto', { x: L+5, y: hY+hH-51, size: 8, font: fontReg, color: dark });
  page.drawText(`CUIT: ${emisorCuit || ''}`, { x: L+5, y: hY+hH-65, size: 8, font: fontReg, color: dark });
  page.drawText(`Pto. Venta: ${String(puntoVenta||1).padStart(4,'0')}`, { x: L+5, y: hY+hH-77, size: 8, font: fontReg, color: dark });

  // Center column (letter)
  const cX = L + lW;
  page.drawRectangle({ x: cX, y: hY, width: cW, height: hH, borderColor: black, borderWidth: 1.5, color: white });
  page.drawText(`COD. ${tipoCmpFmt}`, { x: cX+5, y: hY+hH-12, size: 7, font: fontBold, color: dark });
  page.drawText(invoiceLetter, { x: cX+13, y: hY+28, size: 38, font: fontBold, color: black });

  // Right column (invoice data)
  const rX = cX + cW;
  page.drawRectangle({ x: rX, y: hY, width: rW, height: hH, borderColor: black, borderWidth: 0.5, color: white });
  page.drawText('ORIGINAL', { x: rX + rW/2 - 22, y: hY+hH-14, size: 9, font: fontBold, color: dark });
  page.drawText(`FACTURA`, { x: rX+5, y: hY+hH-30, size: 9, font: fontBold, color: dark });
  page.drawText(`Nro: ${nroFmt}`, { x: rX+5, y: hY+hH-44, size: 9, font: fontReg, color: dark });
  page.drawText(`Fecha de emision: ${fechaCbte || ''}`, { x: rX+5, y: hY+hH-58, size: 8, font: fontReg, color: dark });
  page.drawText(`CUIT: ${emisorCuit || ''}`, { x: rX+5, y: hY+hH-72, size: 8, font: fontReg, color: dark });

  // ================================================================
  // RECEPTOR
  // ================================================================
  const recY = hY - 55;
  page.drawRectangle({ x: L, y: recY, width: W, height: 52, borderColor: black, borderWidth: 0.5, color: lightGray });
  page.drawText('Apellido y Nombre / Razon Social:', { x: L+5, y: recY+38, size: 8, font: fontBold, color: dark });
  page.drawText((receptorNombre || '').substring(0, 50), { x: L+5, y: recY+26, size: 9, font: fontReg, color: dark });
  page.drawText(`CUIL/CUIT: ${receptorCuit || 'Sin datos'}`, { x: L+5, y: recY+13, size: 8, font: fontReg, color: dark });
  page.drawText(`Condicion IVA: ${(receptorIva || '').replace(/_/g, ' ')}`, { x: L+195, y: recY+13, size: 8, font: fontReg, color: dark });

  // ================================================================
  // ITEMS TABLE
  // ================================================================
  const tblHdrY = recY - 24;
  page.drawRectangle({ x: L, y: tblHdrY, width: W, height: 20, color: dark });
  page.drawText('Cant.', { x: L+5, y: tblHdrY+6, size: 8, font: fontBold, color: white });
  page.drawText('Descripcion / Concepto', { x: L+45, y: tblHdrY+6, size: 8, font: fontBold, color: white });
  page.drawText('Precio Unit.', { x: L+355, y: tblHdrY+6, size: 8, font: fontBold, color: white });
  page.drawText('Importe', { x: L+460, y: tblHdrY+6, size: 8, font: fontBold, color: white });

  // Item rows — uno por movimiento incluido en la factura
  const rowHeight = 22;
  const invoiceItems = (items && items.length > 0) ? items : [{ concept: 'Servicio', amount: total }];
  let itemY = tblHdrY - rowHeight;
  invoiceItems.forEach((it) => {
    page.drawRectangle({ x: L, y: itemY, width: W, height: rowHeight, borderColor: gray, borderWidth: 0.5, color: white });
    page.drawText('1', { x: L+10, y: itemY+7, size: 9, font: fontReg, color: dark });
    const descTxt = (it.concept || 'Servicio').substring(0, 48);
    page.drawText(descTxt, { x: L+45, y: itemY+7, size: 9, font: fontReg, color: dark });
    page.drawText(fmt(it.amount), { x: L+355, y: itemY+7, size: 9, font: fontReg, color: dark });
    page.drawText(fmt(it.amount), { x: L+460, y: itemY+7, size: 9, font: fontReg, color: dark });
    itemY -= rowHeight;
  });

  // ================================================================
  // TOTALS — nunca se discrimina IVA (ni Factura A ni B), decisión de contaduría
  // ================================================================
  let yT = itemY - 10;

  // Total row
  page.drawRectangle({ x: L+330, y: yT-22, width: W-330, height: 22, color: dark });
  page.drawText('IMPORTE TOTAL:', { x: L+338, y: yT-14, size: 9, font: fontBold, color: white });
  page.drawText(fmt(total), { x: L+460, y: yT-14, size: 9, font: fontBold, color: white });

  // ================================================================
  // QR + CAE (bottom section)
  // ================================================================
  const qrSecY = 55;
  const qrSecH = 110;
  page.drawRectangle({ x: L, y: qrSecY, width: W, height: qrSecH, borderColor: black, borderWidth: 0.5, color: white });

  // QR image (left side)
  const qrSize = 90;
  page.drawImage(qrImage, { x: L+8, y: qrSecY+10, width: qrSize, height: qrSize });

  // Vertical separator
  page.drawLine({ start: {x: L+108, y: qrSecY+5}, end: {x: L+108, y: qrSecY+qrSecH-5}, thickness: 0.5, color: gray });

  // CAE data (right of QR)
  const caeX = L+116;
  page.drawText('Comprobante Electronico - Resolucion General N 4291/2018', { x: caeX, y: qrSecY+qrSecH-16, size: 7, font: fontReg, color: dark });
  page.drawText(`CAE N: ${cae || ''}`, { x: caeX, y: qrSecY+78, size: 10, font: fontBold, color: dark });
  page.drawText(`Fecha de Vto. del CAE: ${caeVencimiento || ''}`, { x: caeX, y: qrSecY+60, size: 9, font: fontReg, color: dark });
  page.drawLine({ start: {x: caeX, y: qrSecY+52}, end: {x: R-5, y: qrSecY+52}, thickness: 0.3, color: gray });
  page.drawText('Verifique este comprobante en www.afip.gob.ar/fe/qr', { x: caeX, y: qrSecY+38, size: 8, font: fontReg, color: rgb(0.3,0.3,0.3) });

  // Footer
  page.drawText('Comprobante generado electronicamente. Valido ante AFIP.', {
    x: L + W/2 - 130, y: 42, size: 7, font: fontReg, color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}
