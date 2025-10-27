import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { getById as getStudentById } from './studentService.js';
import { getById as getCourseById } from './courseService.js';
import * as paymentService from './paymentService.js';
import { PAYMENT_TYPES } from '../utils/constants.js';

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
      throw new Error('student not found'); //TODO: 404
    }

    if (!course) {
      throw new Error('course not found');
    }

    // Crear descripción del pago
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthName = monthNames[month - 1];
    const description = `Pago de ${monthName} ${year} - ${student.name} ${student.lastName}`;

    // Configurar la preferencia de pago
    const preferenceData = {
      items: [
        {
          id: `course_${courseId}_${studentId}_${year}_${month}`,
          title: course.title,
          description: description,
          quantity: 1,
          unit_price: parseFloat(amount),
          currency_id: 'ARS'
        }
      ],
      external_reference: `${studentId}_${courseId}_${year}_${month}`,
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

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      qr_code: result.qr_code,
      external_reference: result.external_reference,
      mercado_pago_option: mercadoPagoOption
    };

  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    throw new Error(`Error al crear preferencia de pago: ${error.message}`);
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
  
    //TODO: Almacenar webhooks en base de datos
    // Determinar el tipo de notificación
    let paymentStatus = "unknown";
    let paymentId = null;
    let paymentDetails = null;
    
    if (notification.body?.type !== "payment") {
      return;
    }
    paymentId = notification.body?.data?.id;
    //TODO: ver casos bordes
    try {
      paymentDetails = await getPaymentDetailsFromMercadoPago(paymentId);
      if (paymentDetails == null) {
        return;
      }
      
      paymentStatus = paymentDetails.status;
      
      // Usar metadata si está disponible, sino usar external_reference como fallback
      let paymentData = null;
      if (paymentDetails.metadata && Object.keys(paymentDetails.metadata).length > 0) {
        console.log('=== USING METADATA ===');
        console.log('Metadata:', paymentDetails.metadata);
        
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
        
        console.log('=== PAYMENT DETAILS FROM METADATA ===');
        console.log('Student:', paymentData.studentName);
        console.log('Course:', paymentData.courseTitle);
        console.log('Payment for:', paymentData.monthName, paymentData.year);
        console.log('Original amount:', paymentData.originalAmount);
        console.log('Discount:', paymentData.discount);
        console.log('Final amount:', paymentData.finalAmount);
        console.log('Paid amount:', paymentDetails.transaction_amount);
        console.log('Payment status:', paymentStatus);
        
      } else if (paymentDetails.external_reference) {
        console.log('=== USING EXTERNAL REFERENCE (FALLBACK) ===');
        const referenceData = parseExternalReference(paymentDetails.external_reference);
        if (referenceData == null) {
          return;
        }
        
        // Obtener detalles completos del estudiante y curso
        const courseDetails = await getCourseAndStudentDetails(referenceData);
        if (courseDetails == null) {
          return;
        }
        
        paymentData = {
          studentId: referenceData.studentId,
          courseId: referenceData.courseId,
          year: referenceData.year,
          month: referenceData.month,
          originalAmount: paymentDetails.transaction_amount, // No tenemos el original
          discount: 0, // No tenemos el descuento
          finalAmount: paymentDetails.transaction_amount,
          studentName: `${courseDetails.student?.name} ${courseDetails.student?.lastName}`,
          courseTitle: courseDetails.course?.title,
          monthName: getMonthName(referenceData.month)
        };
        
        console.log('=== PAYMENT DETAILS FROM REFERENCE ===');
        console.log('Student:', paymentData.studentName);
        console.log('Course:', paymentData.courseTitle);
        console.log('Payment for:', paymentData.monthName, paymentData.year);
        console.log('Amount:', paymentData.finalAmount);
        console.log('Payment status:', paymentStatus);
      } else {
        console.log('No metadata or external_reference found');
        return;
      }
      
      // Si el pago fue aprobado, crear el registro en la base de datos
      if (paymentStatus === 'approved') {
        console.log('=== CREATING PAYMENT IN DATABASE ===');
        await createPaymentInDatabaseFromMetadata(paymentDetails, paymentData);
      }
    } catch (error) {
      console.error("Error getting payment details:", error);
      return;
    }
    
    // Simular diferentes estados basados en la acción si no se pudo obtener el detalle
    if (!paymentDetails) {
      switch (notification.body?.action) {
      case "payment.created":
        paymentStatus = "pending";
        break;
      case "payment.updated":
        paymentStatus = "processing";
        break;
      default:
        paymentStatus = "unknown";
      }
    }
    
    return { 
      success: true, 
      paymentId, 
      paymentStatus,
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
  //TODO: implementar
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
    console.error('Error getting payment details from MercadoPago:', error);
    throw error;
  }
};

/**
 * Parsear external_reference para extraer datos del pago
 * @param {string} externalReference - Referencia externa (formato: studentId_courseId_year_month)
 * @returns {Object} Datos parseados
 */
const parseExternalReference = (externalReference) => {
  try {
    const parts = externalReference.split('_');
    if (parts.length === 4) {
      return {
        studentId: parseInt(parts[0]),
        courseId: parseInt(parts[1]),
        year: parseInt(parts[2]),
        month: parseInt(parts[3])
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing external reference:', error);
    return null;
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

    console.log('Creating payment with metadata:', dbPaymentData);
    
    // Crear el pago en la base de datos
    const createdPayment = await paymentService.create(dbPaymentData, null, false);
    
    console.log('Payment created successfully in database:', createdPayment.id);
    
    return createdPayment;
  } catch (error) {
    console.error('Error creating payment in database:', error);
    throw error;
  }
};

const createPaymentInDatabase = async (paymentDetails, referenceData, courseDetails) => {
  try {
    // Calcular fechas
    const now = new Date();
    const operativeDate = new Date(referenceData.year, referenceData.month - 1, 15); // Día 15 del mes especificado
    
    // Preparar datos del pago
    const paymentData = {
      studentId: referenceData.studentId,
      courseId: referenceData.courseId,
      amount: paymentDetails.transaction_amount,
      discount: 0, // TODO: Calcular descuento desde el monto original vs monto pagado
      type: PAYMENT_TYPES.MERCADO_PAGO,
      at: operativeDate.getTime(), // Fecha operativa (día 15 del mes)
      operativeResult: operativeDate.getTime(), // Misma fecha operativa
      createdAt: now, // Fecha actual de creación
      verified: true, // Los pagos de MercadoPago se consideran verificados automáticamente
      mercadoPagoId: paymentDetails.id, // ID del pago en MercadoPago
      mercadoPagoStatus: paymentDetails.status,
      description: `Pago MercadoPago - ${getMonthName(referenceData.month)} ${referenceData.year}`,
      // Agregar información adicional de MercadoPago
      paymentMethodId: paymentDetails.payment_method_id,
      paymentTypeId: paymentDetails.payment_type_id,
      statusDetail: paymentDetails.status_detail
    };

    console.log('Creating payment with data:', paymentData);
    
    // Crear el pago en la base de datos
    const createdPayment = await paymentService.create(paymentData, null, false);
    
    console.log('Payment created successfully in database:', createdPayment.id);
    
    return createdPayment;
  } catch (error) {
    console.error('Error creating payment in database:', error);
    throw error;
  }
};
