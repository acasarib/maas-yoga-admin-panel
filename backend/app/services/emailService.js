import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Configuración del transportador de email
const createTransporter = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const connectionTimeout = Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000);
  const greetingTimeout = Number(process.env.SMTP_GREETING_TIMEOUT || 10000);
  const socketTimeout = Number(process.env.SMTP_SOCKET_TIMEOUT || 10000);
  const pool = process.env.SMTP_POOL ? process.env.SMTP_POOL === "true" : true;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    pool,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false" ? { rejectUnauthorized: false } : undefined,
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
  const maxRetries = Number(process.env.SMTP_MAX_RETRIES || 3);
  const baseDelay = Number(process.env.SMTP_RETRY_DELAY_MS || 2000);
  const retriableErrors = new Set(["ETIMEDOUT", "ECONNECTION", "ECONNRESET", "EAI_AGAIN"]);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await sendEmailWithPDF(studentEmail, subject, text, pdfBuffer, pdfFileName, html);
    } catch (error) {
      const shouldRetry =
        retriableErrors.has(error?.code) || error?.command === "CONN";

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * attempt;
      console.warn(`Error enviando email (intento ${attempt}/${maxRetries}). Reintentando en ${delay}ms`, error.message || error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Envía un email con el link de pago de MercadoPago
 * @param {Object} emailData - Datos del email
 * @param {string} emailData.paymentLink - Link de pago de MercadoPago
 * @param {string} emailData.studentEmail - Email del estudiante
 * @param {string} emailData.studentName - Nombre completo del estudiante
 * @param {string} emailData.courseName - Nombre del curso
 * @param {string} emailData.monthName - Nombre del mes
 * @param {number} emailData.year - Año del pago
 * @param {number} emailData.amount - Importe del pago
 * @param {string} emailData.qrImageBase64 - Imagen QR en base64 (opcional)
 * @returns {Promise} - Resultado del envío
 */
export const sendPaymentLink = async (emailData) => {
  try {
    const { paymentLink, studentEmail, studentName, courseName, monthName, year, amount, qrImageBase64 } = emailData;

    // Configurar transporter
    const transporter = createTransporter();

    // Preparar attachments si hay QR
    const attachments = [];
    let qrImageHtml = '';
    
    if (qrImageBase64) {
      attachments.push({
        filename: 'qr-code.png',
        content: qrImageBase64,
        encoding: 'base64',
        cid: 'qrcode'
      });
      
      qrImageHtml = `
        <div style="text-align: center; margin: 30px 0;">
          <img src="cid:qrcode" alt="Código QR de Pago" style="max-width: 200px; border: 1px solid #ddd; border-radius: 8px;">
        </div>
      `;
    }

    // Contenido del email
    const mailOptions = {
      from: `"Sistema de Pagos" <${process.env.SMTP_USER}>`,
      to: studentEmail,
      subject: `Link de pago - ${courseName} - ${monthName} ${year}`,
      attachments: attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://i.imgur.com/JMM3XLw.png" alt="MAAS Yoga Logo" 
                 style="max-width: 300px; height: auto;">
          </div>
          
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Link de Pago</h2>
          
          <p style="font-size: 16px;">Hola <strong>${studentName}</strong>,</p>
          <p style="font-size: 16px;">Te enviamos el link de pago para:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Curso:</strong> ${courseName}</li>
              <li style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Período:</strong> ${monthName} ${year}</li>
              <li style="padding: 8px 0;"><strong>Importe:</strong> $${amount}</li>
            </ul>
          </div>
          
          ${qrImageHtml}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-size: 16px; font-weight: bold;">
              Pagar Ahora
            </a>
          </div>
          
          <p style="font-size: 16px;">Saludos,<br><strong>Equipo MAAS Yoga</strong></p>
        </div>
      `,
      text: `
        Hola ${studentName},
        
        Te enviamos el link de pago para:
        - Curso: ${courseName}
        - Período: ${monthName} ${year}
        - Importe: $${amount}
        
        Link de pago: ${paymentLink}
        
        Saludos,
        Equipo MAAS Yoga
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email de pago enviado exitosamente:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error enviando email de pago:", error);
    throw error;
  }
};