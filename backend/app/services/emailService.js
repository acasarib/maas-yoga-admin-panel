import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Envía un email con un PDF adjunto
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del email
 * @param {string} text - Texto del email
 * @param {Buffer} pdfBuffer - Buffer del PDF a adjuntar
 * @param {string} pdfFileName - Nombre del archivo PDF
 * @param {string} html - Contenido HTML del email (opcional)
 * @returns {Promise} - Resultado del envío
 */
export const sendEmailWithPDF = async (to, subject, text, pdfBuffer, pdfFileName, html = "") => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: [
        {
          filename: pdfFileName,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email enviado exitosamente:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error enviando email:", error);
    throw error;
  }
};

/**
 * Carga y procesa el template HTML del recibo
 * @param {string} firstName - Nombre del estudiante
 * @param {string} lastName - Apellido del estudiante
 * @returns {string} - HTML procesado
 */
const loadEmailTemplate = (firstName, lastName) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const templatePath = path.join(__dirname, "../templates/payment_receipt.html");
    
    let html = fs.readFileSync(templatePath, "utf8");
    
    // Reemplazar placeholders
    html = html.replace(/{firstName}/g, firstName);
    html = html.replace(/{lastName}/g, lastName);
    
    return html;
  } catch (error) {
    console.error("Error cargando template HTML:", error);
    // Fallback a HTML simple si no se puede cargar el template
    return `
      <html>
        <body>
          <h2>Recibo de Pago - MAAS Yoga</h2>
          <p>Hola ${firstName} ${lastName},</p>
          <p>Adjunto encontrarás el recibo de tu pago.</p>
          <p>Gracias por tu confianza.</p>
          <p>Saludos,<br>Equipo MAAS Yoga</p>
        </body>
      </html>
    `;
  }
};

/**
 * Envía el recibo de pago por email
 * @param {string} studentEmail - Email del estudiante
 * @param {string} studentName - Nombre del estudiante
 * @param {Buffer} pdfBuffer - Buffer del PDF del recibo
 * @param {string} paymentId - ID del pago
 * @returns {Promise} - Resultado del envío
 */
export const sendPaymentReceipt = async (studentEmail, studentName, pdfBuffer, paymentId) => {
  const subject = "Recibo de Pago - MAAS Yoga";
  const text = `Hola ${studentName},\n\nAdjunto encontrarás el recibo de tu pago.\n\nGracias por tu confianza.\n\nSaludos,\nEquipo MAAS Yoga`;
  const pdfFileName = `recibo_pago_${paymentId}.pdf`;

  // Extraer firstName y lastName del studentName
  const nameParts = studentName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Cargar y procesar el template HTML
  const html = loadEmailTemplate(firstName, lastName);

  return await sendEmailWithPDF(studentEmail, subject, text, pdfBuffer, pdfFileName, html);
}; 