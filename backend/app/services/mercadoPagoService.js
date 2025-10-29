import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getById as getStudentById } from './studentService.js';
import { getById as getCourseById } from './courseService.js';
import * as paymentService from './paymentService.js';
import { PAYMENT_TYPES } from '../utils/constants.js';
import { mercado_pago_payment } from '../db/index.js';

// Configurar MercadoPago con las credenciales
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error("MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno");
  throw new Error("MercadoPago access token is required");
}

console.log("MercadoPago Access Token configurado:", accessToken.substring(0, 10) + "...");

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
 * @param {number} paymentData.amount - Precio del pago
 * @param {number} paymentData.discount - Descuento del pago
 * @param {string} paymentData.mercadoPagoOption - Opción de MercadoPago (link, qr, email)
 * @returns {Object} Preferencia creada con el link de pago
 */
export const createPaymentPreference = async (paymentData) => {
  try {
    console.log("Creando preferencia de MercadoPago con datos:", paymentData);
    const { studentId, courseId, year, month, amount, discount, mercadoPagoOption } = paymentData;

    // Obtener datos del estudiante y curso
    const student = await getStudentById(studentId);
    const course = await getCourseById(courseId);

    if (!student) {
      throw new Error("student not found"); //TODO: 404
    }

    if (!course) {
      throw new Error("course not found");
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
      items: [
        {
          id: `course_${courseId}_student_${studentId}_${year}_${month}`,
          title: `${course.title} - ${monthName} ${year}`,
          description: description,
          quantity: 1,
          unit_price: parseFloat(amount),
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
        original_amount: amount,
        discount: discount || 0,
        final_amount: amount - (discount || 0),
        mercado_pago_option: mercadoPagoOption,
        student_name: `${student.name} ${student.lastName}`,
        course_title: course.title,
        month_name: monthName
      }
    };

    // Crear la preferencia
    const result = await preference.create({ body: preferenceData });

    // Guardar la preferencia en nuestra base de datos
    const preferenceId = `pref_${result.id}_${studentId}_${courseId}_${year}_${month}`;
    const preferenceLink = result.init_point || result.sandbox_init_point;
    
    try {
      await mercado_pago_payment.create({
        id: preferenceId,
        preferenceId,
        externalReference,
        status: "pending",
        completed: false,
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        year: parseInt(year),
        month: parseInt(month),
        originalAmount: parseFloat(amount),
        discount: parseFloat(discount || 0),
        finalAmount: parseFloat(amount),
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
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      qr_code: result.qr_code,
      external_reference: result.external_reference,
      mercado_pago_option: mercadoPagoOption
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
      transactionAmount: paymentDetails.transaction_amount,
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

export const updateMercadoPagoPayment = async (paymentId, paymentDetails) => {
  try {
    const mpPayment = await mercado_pago_payment.findByPk(paymentId);
    if (mpPayment) {
      await mpPayment.update({
        completed: paymentDetails.completed,
        paymentId: paymentDetails.paymentId,
        status: paymentDetails.status,
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
    console.log("Processing webhook notification at " + timestamp);
    console.log("Notification body:", notification.body);
    console.log("Notification query:", notification.query);
    
  
    //TODO: Almacenar webhooks en base de datos
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
        originalAmount: parseFloat(paymentDetails.metadata.original_amount),
        discount: parseFloat(paymentDetails.metadata.discount || 0),
        finalAmount: parseFloat(paymentDetails.metadata.final_amount),
        studentName: paymentDetails.metadata.student_name,
        courseTitle: paymentDetails.metadata.course_title,
        monthName: paymentDetails.metadata.month_name
      };
    }

    // Si el pago fue aprobado, crear el registro en la base de datos
    if (paymentDetails.status === "approved" && !paymentDetails.completed) {
      const createdPayment = await createPaymentInDatabaseFromMetadata(paymentDetails, paymentData);
      paymentDetails.completed = true;
      paymentDetails.paymentId = createdPayment.id;
      await updateMercadoPagoPayment(paymentId, paymentDetails);
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
      success: true,
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
      value: paymentData.originalAmount, // Monto original (antes del descuento)
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
