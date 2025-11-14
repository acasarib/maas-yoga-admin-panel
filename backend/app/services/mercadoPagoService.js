import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getById as getStudentById } from './studentService.js';
import { getById as getCourseById } from './courseService.js';
import * as paymentService from './paymentService.js';
import { PAYMENT_TYPES } from '../utils/constants.js';
import { mercado_pago_payment, notificationPayment, user } from '../db/index.js';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import * as emailService from "./emailService.js";
import { StatusCodes } from "http-status-codes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar MercadoPago con las credenciales
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error("MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno");
  //throw new Error("MercadoPago access token is required");
}

const client = new MercadoPagoConfig({
  accessToken: accessToken,
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

/**
 * Crear una preferencia de pago para un curso
 * @param {Object} paymentData - Datos del pago
 * @param {string} paymentData.studentId - ID del estudiante
 * @param {string} paymentData.courseId - ID del curso
 * @param {number} paymentData.year - Año del pago
 * @param {number} paymentData.month - Mes del pago (1-12)
 * @param {number} paymentData.value - Precio del pago
 * @param {number} paymentData.discount - Descuento del pago
 * @returns {Object} Preferencia creada con el link de pago
 */
export const createPaymentPreference = async (paymentData) => {
  if (!accessToken) {
    console.error("MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno");
    throw  ({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Falta configuracion de mercado pago en el servidor" });
  }
  try {
    const { studentId, courseId, year, month, value, discount, sendNotification, informerId } = paymentData;

    // Verificar si ya existe una preferencia para este estudiante, curso, año y mes
    const existingPreference = await mercado_pago_payment.findOne({
      where: {
        student_id: studentId,
        course_id: courseId,
        year: year,
        month: month,
        value: value,
        discount: discount,
      }
    });

    // Si ya existe, devolver la preferencia existente
    if (existingPreference) {
      return {
        id: existingPreference.id,
        link: existingPreference.preferenceLink,
        externalReference: existingPreference.externalReference,
        mercadoPagoPaymentId: existingPreference.id,
      };
    }

    // Obtener datos del estudiante y curso
    const student = await getStudentById(studentId);
    const course = await getCourseById(courseId);

    if (!student) {
      const error = new Error("Estudiante no encontrado");
      error.statusCode = 404;
      throw error;
    }

    if (!course) {
      const error = new Error("Curso no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Crear descripción del pago
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const monthName = monthNames[month - 1];
    const description = `Pago de ${monthName} ${year} - ${student.name} ${student.lastName}`;

    // Configurar la preferencia de pago
    const externalReference = `course_${courseId}_student_${studentId}_${year}_${month}`;
    const preferenceData = {
      statement_descriptor: `MAAS Yoga - ${course.title}`,
      items: [
        {
          id: `course_${courseId}_student_${studentId}_${year}_${month}`,
          title: `${course.title} - ${monthName} ${year}`,
          description: description,
          quantity: 1,
          unit_price: parseFloat(value),
          currency_id: "ARS"
        }
      ],
      external_reference: externalReference,
      // Webhook solo si está configurado
      ...(process.env.MERCADOPAGO_WEB_HOOK_URL && {
        notification_url: `${process.env.MERCADOPAGO_WEB_HOOK_URL}/api/v1/payments/mercadopago/webhook`
      }),
      metadata: {
        student_id: studentId,
        course_id: courseId,
        year: year,
        month: month,
        value: value,
        discount: discount || 0,
        student_name: `${student.name} ${student.lastName}`,
        course_title: course.title,
        month_name: monthName,
        send_notification: sendNotification || false,
        informer_id: informerId,
      }
    };

    // Crear la preferencia
    const result = await preference.create({ body: preferenceData });

    // Guardar la preferencia en nuestra base de datos
    const preferenceId = `pref_${result.id}_${studentId}_${courseId}_${year}_${month}`;
    const preferenceLink = result.init_point || result.sandbox_init_point;
    
    let savedPreference = null;
    try {
      savedPreference = await mercado_pago_payment.create({
        id: preferenceId,
        preferenceId,
        externalReference,
        status: "pending",
        completed: false,
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        year: parseInt(year),
        month: parseInt(month),
        value: parseFloat(value),
        discount: parseFloat(discount || 0),
        paymentId: null,
        preferenceLink: preferenceLink,
        studentName: `${student.name} ${student.lastName}`,
        courseTitle: course.title,
        monthName: monthName,
      });
    } catch (error) {
      console.error("Error saving preference to database:", error);
      // No fallar si no se puede guardar en DB, pero logear el error
    }

    return {
      id: savedPreference.id,
      link: result.init_point,
      externalReference: result.external_reference,
      mercadoPagoPaymentId: savedPreference?.id || null
    };

  } catch (error) {
    console.error("Error creating MercadoPago preference:", error);
    throw new Error(`Error al crear preferencia de pago: ${error.message}`);
  }
};

export const getAndUpdateMercadoPagoPayment = async (paymentId) => {
  // Obtener detalles actualizados desde MercadoPago API
  const paymentDetails = await getPaymentDetailsFromMercadoPago(paymentId);
  if (paymentDetails == null) {
    return null;
  }
  const externalReference = paymentDetails.external_reference;

  try {
    // Buscar el pago en nuestra base de datos
    let mpPayment = await mercado_pago_payment.findOne({ where: { externalReference } });
    
    if (mpPayment == null || mpPayment == undefined) {
      // No deberia pasar, pero igualmente proceso el pago
      console.log("Payment not found in database");
      return paymentDetails;
    }
    // Si existe, actualizar el status
    await mpPayment.update({
      id: paymentId,
      status: paymentDetails.status,
      value: paymentDetails.value,
      paymentMethodId: paymentDetails.payment_method_id,
      paymentTypeId: paymentDetails.payment_type_id,
      statusDetail: paymentDetails.status_detail,
    });
    
    // Agregar los datos actualizados al objeto de respuesta
    paymentDetails.completed = mpPayment.completed;
    paymentDetails.paymentId = mpPayment.paymentId;
  } catch (error) {
    console.error("Error managing MercadoPago payment in database:", error);
    throw error;
  }
  
  return paymentDetails;
};

export const updateMercadoPagoPayment = async (paymentDetails) => {
  try {
    const mpPayment = await mercado_pago_payment.findOne({ where: { externalReference: paymentDetails.external_reference } });
    if (mpPayment) {
      await mpPayment.update({
        completed: paymentDetails.completed,
        paymentId: paymentDetails.paymentId,
        status: paymentDetails.status,
        statusDetail: paymentDetails.status_detail,
      });
    }
  } catch (error) {
    console.error("Error updating MercadoPago payment:", error);
    throw error;
  }
};

/**
 * Procesar notificación de webhook de MercadoPago
 * @param {Object} notification - Datos de la notificación
 * @returns {Object} Resultado del procesamiento
 */
export const processWebhookNotification = async (notification) => {
  try {
    const timestamp = new Date().toISOString();
  
    let paymentId = null;
    let paymentDetails = null;
    if (notification.body?.type !== "payment") {
      return;
    }
    paymentId = notification.body?.data?.id;
    paymentDetails = await getAndUpdateMercadoPagoPayment(paymentId);
    if (paymentDetails == null) {
      console.error("Payment details not found, id=" + paymentId);
      return;
    }
    
    let paymentData = null;
    if (paymentDetails.metadata && Object.keys(paymentDetails.metadata).length > 0) {        
      paymentData = {
        studentId: parseInt(paymentDetails.metadata.student_id),
        courseId: parseInt(paymentDetails.metadata.course_id),
        year: parseInt(paymentDetails.metadata.year),
        month: parseInt(paymentDetails.metadata.month),
        value: parseFloat(paymentDetails.metadata.value),
        discount: parseFloat(paymentDetails.metadata.discount || 0),
        studentName: paymentDetails.metadata.student_name,
        courseTitle: paymentDetails.metadata.course_title,
        monthName: paymentDetails.metadata.month_name,
        sendNotification: paymentDetails.metadata.send_notification,
        informerId: paymentDetails.metadata.informer_id,
        statusDetail: paymentDetails.status_detail,
        externalReference: paymentDetails.external_reference,
      };
    }

    // Si el pago fue aprobado, crear el registro en la base de datos
    if (paymentDetails.status === "approved" && !paymentDetails.completed) {
      const createdPayment = await createPaymentInDatabaseFromMetadata(paymentDetails, paymentData);
      paymentDetails.completed = true;
      paymentDetails.paymentId = createdPayment.id;
      await updateMercadoPagoPayment(paymentDetails);
      if (paymentData.sendNotification) {
        await sendNotificationToUser(paymentData, createdPayment.id);
      }
    }
    
    return { 
      success: true, 
      paymentId, 
      paymentStatus: paymentDetails.status,
      timestamp 
    };
  } catch (error) {
    console.error("Error processing webhook notification:", error);
    throw error;
  }
};

/**
 * Obtener historial de webhooks recibidos
 * @returns {Object} Historial de webhooks
 */
export const getWebhookHistory = async () => {
  try {
    // Obtener todos los registros de mercado_pago_payment con relaciones
    const payments = await mercado_pago_payment.findAll({
      include: [
        {
          association: "student",
          attributes: ["id", "name", "lastName", "email"]
        },
        {
          association: "course", 
          attributes: ["id", "title"]
        },
        {
          association: "payment",
          attributes: ["id", "value", "at", "verified"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit: 100 // Limitar a los últimos 100 registros
    });

    // Estadísticas básicas
    const stats = {
      total: payments.length,
      completed: payments.filter(p => p.completed).length,
      pending: payments.filter(p => !p.completed).length,
      byStatus: {}
    };

    // Contar por status
    payments.forEach(payment => {
      stats.byStatus[payment.status] = (stats.byStatus[payment.status] || 0) + 1;
    });

    return {
      data: payments,
      stats: stats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting webhook history:", error);
    throw error;
  }
};

/**
 * Obtener información de un pago por ID
 * @param {string} paymentId - ID del pago en MercadoPago
 * @returns {Object} Información del pago
 */
export const getPaymentInfo = async (paymentId) => {
  try {
    // Implementar lógica para obtener información del pago
    // usando el SDK de MercadoPago
    console.log('Getting payment info for:', paymentId);
    
    // TODO: Implementar usando Payment API de MercadoPago
    // const payment = new Payment(client);
    // const paymentData = await payment.get({ id: paymentId });
    
    return { paymentId };
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};

/**
 * Obtener detalles del pago desde MercadoPago
 * @param {string} paymentId - ID del pago
 * @returns {Object} Detalles del pago
 */
const getPaymentDetailsFromMercadoPago = async (paymentId) => {
  try {
    const paymentData = await payment.get({ id: paymentId });
    return paymentData;
  } catch (error) {
    console.error("Error getting payment details from MercadoPago:", error);
    throw error;
  }
};

/**
 * Obtener detalles del curso y estudiante
 * @param {Object} referenceData - Datos de la referencia
 * @returns {Object} Detalles del curso y estudiante
 */
const getCourseAndStudentDetails = async (referenceData) => {
  try {
    const [student, course] = await Promise.all([
      getStudentById(referenceData.studentId),
      getCourseById(referenceData.courseId)
    ]);

    return {
      student,
      course,
      year: referenceData.year,
      month: referenceData.month
    };
  } catch (error) {
    console.error('Error getting course and student details:', error);
    return null;
  }
};

/**
 * Obtener nombre del mes
 * @param {number} month - Número del mes (1-12)
 * @returns {string} Nombre del mes
 */
const getMonthName = (month) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return monthNames[month - 1] || 'Mes desconocido';
};

/**
 * Crear pago en la base de datos
 * @param {Object} paymentDetails - Detalles del pago de MercadoPago
 * @param {Object} referenceData - Datos de la referencia externa
 * @param {Object} courseDetails - Detalles del curso y estudiante
 */
/**
 * Crear pago en la base de datos usando metadata
 * @param {Object} paymentDetails - Detalles del pago de MercadoPago
 * @param {Object} paymentData - Datos del pago extraídos de metadata
 */
const createPaymentInDatabaseFromMetadata = async (paymentDetails, paymentData) => {
  try {
    // Calcular fechas
    const now = new Date();
    const operativeDate = new Date(paymentData.year, paymentData.month - 1, 15); // Día 15 del mes especificado
    
    // Preparar datos del pago
    const dbPaymentData = {
      studentId: paymentData.studentId,
      courseId: paymentData.courseId,
      value: paymentData.value, // Monto original (antes del descuento)
      discount: paymentData.discount, // Descuento aplicado
      type: PAYMENT_TYPES.MERCADO_PAGO,
      at: operativeDate.getTime(), // Fecha operativa (día 15 del mes)
      operativeResult: operativeDate.getTime(), // Misma fecha operativa
      createdAt: now, // Fecha actual de creación
      verified: true, // Los pagos de MercadoPago se consideran verificados automáticamente
      mercadoPagoId: paymentDetails.id, // ID del pago en MercadoPago
      mercadoPagoStatus: paymentDetails.status,
      description: `Pago MercadoPago - ${paymentData.monthName} ${paymentData.year}`,
      // Agregar información adicional de MercadoPago
      paymentMethodId: paymentDetails.payment_method_id,
      paymentTypeId: paymentDetails.payment_type_id,
      statusDetail: paymentDetails.status_detail
    };
    
    // Crear el pago en la base de datos
    const createdPayment = await paymentService.create(dbPaymentData, null, false);    
    return createdPayment;
  } catch (error) {
    console.error("Error creating payment in database:", error);
    throw error;
  }
};

/**
 * Generar código QR con logo embebido
 * @param {string} paymentLink - Link de pago de MercadoPago
 * @returns {Buffer} Buffer de la imagen QR con logo
 */
export const generateQRWithLogo = async (paymentLink) => {
  try {
    // Dynamic import de Jimp para compatibilidad con ES modules
    const { default: Jimp } = await import('jimp');
    
    // Generar QR code básico
    const qrBuffer = await QRCode.toBuffer(paymentLink, {
      errorCorrectionLevel: 'H', // Alto nivel de corrección para permitir logo
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    // Cargar el QR generado
    const qrImage = await Jimp.read(qrBuffer);
    
    // Cargar el logo
    const logoPath = path.join(__dirname, '../images/logo.png');
    let logoImage;
    
    try {
      logoImage = await Jimp.read(logoPath);
    } catch (error) {
      console.warn('Logo no encontrado, generando QR sin logo:', error.message);
      return qrBuffer; // Devolver QR sin logo si no se encuentra el archivo
    }

    // Redimensionar logo (aproximadamente 20% del tamaño del QR)
    const logoSize = Math.floor(qrImage.getWidth() * 0.2);
    logoImage.resize(logoSize, logoSize);

    // Crear un fondo blanco circular para el logo
    const logoWithBackground = new Jimp(logoSize + 20, logoSize + 20, 0xFFFFFFFF);
    
    // Centrar el logo en el fondo blanco
    logoWithBackground.composite(logoImage, 10, 10);

    // Calcular posición central para el logo
    const centerX = Math.floor((qrImage.getWidth() - logoWithBackground.getWidth()) / 2);
    const centerY = Math.floor((qrImage.getHeight() - logoWithBackground.getHeight()) / 2);

    // Superponer el logo en el centro del QR
    qrImage.composite(logoWithBackground, centerX, centerY);

    // Convertir a buffer
    const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
    return finalBuffer;

  } catch (error) {
    console.error("Error generating QR with logo:", error);
    throw error;
  }
};

/**
 * Enviar email con link de pago
 * @param {Object} emailData - Datos del email
 * @returns {Promise} Resultado del envío
 */
export const sendPaymentEmail = async (emailData) => {
  try {
    // Generar QR code en base64 para incluir en el email
    const qrBuffer = await generateQRWithLogo(emailData.paymentLink);
    const qrImageBase64 = qrBuffer.toString('base64');
    
    // Agregar el QR al emailData
    const emailDataWithQR = {
      ...emailData,
      qrImageBase64
    };
    
    // Delegar al emailService para mantener separación de responsabilidades
    const result = await emailService.sendPaymentLink(emailDataWithQR);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error("Error sending payment email:", error);
    throw error;
  }
};

/**
 * Obtener preferencia de MercadoPago por ID
 * @param {string} id - ID de la preferencia
 * @returns {Object} Datos de la preferencia
 */
export const getMercadoPagoPaymentById = async (id) => {
  try {
    const preference = await mercado_pago_payment.findByPk(id);
    return preference;
  } catch (error) {
    console.error("Error getting MercadoPago payment by ID:", error);
    throw error;
  }
};

const sendNotificationToUser = async (paymentData, paymentId) => {
  try {
    notificationPayment.create({ paymentId, userId: paymentData.informerId });
  } catch (error) {
    console.error("Error sending notification to user:", error);
    throw error;
  }
};