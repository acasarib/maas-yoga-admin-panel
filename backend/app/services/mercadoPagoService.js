import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getById as getStudentById } from './studentService.js';
import { getById as getCourseById } from './courseService.js';

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

/**
 * Crear una preferencia de pago para un curso
 * @param {Object} paymentData - Datos del pago
 * @param {string} paymentData.studentId - ID del estudiante
 * @param {string} paymentData.courseId - ID del curso
 * @param {number} paymentData.year - Año del pago
 * @param {number} paymentData.month - Mes del pago (1-12)
 * @param {number} paymentData.amount - Precio del pago
 * @param {string} paymentData.mercadoPagoOption - Opción de MercadoPago (link, qr, email)
 * @returns {Object} Preferencia creada con el link de pago
 */
export const createPaymentPreference = async (paymentData) => {
  try {
    console.log("Creando preferencia de MercadoPago con datos:", paymentData);
    const { studentId, courseId, year, month, amount, mercadoPagoOption } = paymentData;

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
      })
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
    // Aquí puedes procesar las notificaciones de MercadoPago
    // Por ejemplo, actualizar el estado del pago en tu base de datos
    console.log('Processing MercadoPago webhook:', notification);
    
    // TODO: Implementar lógica para actualizar el estado del pago
    // basado en la notificación recibida
    
    return { success: true };
  } catch (error) {
    console.error('Error processing webhook notification:', error);
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
    
    return { paymentId };
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
};
