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
