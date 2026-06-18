import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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
 * Genera un PDF de factura AFIP desde cero con los datos del pago.
 * @param {Object} data
 * @returns {Promise<Buffer>}
 */
export async function generateAfipInvoicePDF(data) {
  const {
    invoiceType, invoiceNumber, puntoVenta, fechaCbte,
    emisorCuit, emisorNombre,
    receptorNombre, receptorCuit, receptorIva,
    descripcion, total, impNeto, impIVA, impOpEx,
    cae, caeVencimiento, esResponsable,
  } = data;

  const pdfDoc = await PDFDocument.create();
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([595, 842]); // A4

  const W = 595;
  const gray = rgb(0.85, 0.85, 0.85);
  const dark = rgb(0.15, 0.15, 0.15);
  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
  const green = rgb(0.1, 0.55, 0.1);

  const fmt = (n) => {
    if (n == null) return '';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n);
  };

  const invoiceLetter = invoiceType?.includes('A') ? 'A' : 'B';
  const nroFormatted = `${String(puntoVenta || 1).padStart(4, '0')}-${String(invoiceNumber || 0).padStart(8, '0')}`;

  // === HEADER ===
  // Left box (emisor)
  page.drawRectangle({ x: 30, y: 760, width: 220, height: 70, color: gray });
  page.drawText(emisorNombre || 'Emisor', { x: 38, y: 805, size: 11, font: fontBold, color: dark });
  page.drawText(`CUIT: ${emisorCuit || ''}`, { x: 38, y: 788, size: 9, font: fontReg, color: dark });
  page.drawText(`Pto. Venta: ${String(puntoVenta || 1).padStart(4, '0')}`, { x: 38, y: 773, size: 9, font: fontReg, color: dark });

  // Center box (invoice letter)
  page.drawRectangle({ x: 250, y: 760, width: 95, height: 70, borderColor: black, borderWidth: 2, color: white });
  page.drawText(invoiceLetter, { x: 280, y: 780, size: 36, font: fontBold, color: dark });
  page.drawText('FACTURA', { x: 256, y: 765, size: 8, font: fontBold, color: dark });

  // Right box (invoice data)
  page.drawRectangle({ x: 345, y: 760, width: 220, height: 70, color: gray });
  page.drawText(`FACTURA ${invoiceLetter}`, { x: 353, y: 813, size: 11, font: fontBold, color: dark });
  page.drawText(`N°: ${nroFormatted}`, { x: 353, y: 797, size: 9, font: fontReg, color: dark });
  page.drawText(`Fecha: ${fechaCbte || ''}`, { x: 353, y: 782, size: 9, font: fontReg, color: dark });
  page.drawText(`ORIGINAL`, { x: 353, y: 767, size: 8, font: fontBold, color: dark });

  // === RECEPTOR ===
  page.drawRectangle({ x: 30, y: 700, width: 535, height: 50, color: rgb(0.97, 0.97, 0.97) });
  page.drawText('DATOS DEL RECEPTOR', { x: 38, y: 736, size: 9, font: fontBold, color: dark });
  page.drawText(`Nombre / Razón Social: ${receptorNombre || ''}`, { x: 38, y: 722, size: 9, font: fontReg, color: dark });
  page.drawText(`CUIL / CUIT: ${receptorCuit || 'Sin datos'}`, { x: 38, y: 710, size: 9, font: fontReg, color: dark });
  page.drawText(`Condición IVA: ${(receptorIva || '').replace(/_/g, ' ')}`, { x: 290, y: 710, size: 9, font: fontReg, color: dark });

  // === ITEMS TABLE HEADER ===
  page.drawRectangle({ x: 30, y: 665, width: 535, height: 22, color: dark });
  page.drawText('DESCRIPCIÓN', { x: 38, y: 671, size: 9, font: fontBold, color: white });
  page.drawText('IMPORTE', { x: 490, y: 671, size: 9, font: fontBold, color: white });

  // === ITEM ROW ===
  page.drawRectangle({ x: 30, y: 620, width: 535, height: 44, borderColor: gray, borderWidth: 1, color: white });
  const descText = (descripcion || 'Servicio').substring(0, 65);
  page.drawText(descText, { x: 38, y: 644, size: 9, font: fontReg, color: dark });
  page.drawText(fmt(total), { x: 480, y: 644, size: 9, font: fontReg, color: dark });

  // === TOTALS ===
  let yTotals = 600;

  if (esResponsable) {
    page.drawLine({ start: { x: 380, y: yTotals }, end: { x: 565, y: yTotals }, thickness: 0.5, color: gray });
    yTotals -= 16;
    page.drawText('Neto gravado:', { x: 390, y: yTotals, size: 9, font: fontReg, color: dark });
    page.drawText(fmt(impNeto), { x: 490, y: yTotals, size: 9, font: fontReg, color: dark });
    yTotals -= 16;
    page.drawText('IVA 21%:', { x: 390, y: yTotals, size: 9, font: fontReg, color: dark });
    page.drawText(fmt(impIVA), { x: 490, y: yTotals, size: 9, font: fontReg, color: dark });
    yTotals -= 4;
    page.drawLine({ start: { x: 380, y: yTotals }, end: { x: 565, y: yTotals }, thickness: 0.5, color: gray });
    yTotals -= 4;
  }

  // Total box
  page.drawRectangle({ x: 380, y: yTotals - 24, width: 185, height: 24, color: dark });
  page.drawText('TOTAL:', { x: 390, y: yTotals - 16, size: 10, font: fontBold, color: white });
  page.drawText(fmt(total), { x: 480, y: yTotals - 16, size: 10, font: fontBold, color: white });

  // === CAE BOX ===
  page.drawRectangle({ x: 30, y: 480, width: 535, height: 60, borderColor: green, borderWidth: 1.5, color: rgb(0.94, 0.99, 0.94) });
  page.drawText('DATOS DE VALIDACIÓN AFIP', { x: 38, y: 526, size: 9, font: fontBold, color: green });
  page.drawText(`CAE: ${cae || ''}`, { x: 38, y: 510, size: 11, font: fontBold, color: dark });
  page.drawText(`Vencimiento CAE: ${caeVencimiento || ''}`, { x: 38, y: 494, size: 9, font: fontReg, color: dark });

  // === FOOTER ===
  page.drawLine({ start: { x: 30, y: 460 }, end: { x: 565, y: 460 }, thickness: 0.5, color: gray });
  page.drawText('Comprobante generado electrónicamente. Válido como factura ante AFIP.', {
    x: 100, y: 445, size: 8, font: fontReg, color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}
