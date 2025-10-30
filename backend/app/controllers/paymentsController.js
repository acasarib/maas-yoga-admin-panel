import * as paymentService from "../services/paymentService.js";
import * as mercadoPagoService from "../services/mercadoPagoService.js";
import { StatusCodes } from "http-status-codes";
import Specification from "../models/Specification.js";
import { payment } from "../db/index.js";
import { getById } from "../services/studentService.js";
import { PAYMENT_TYPES } from "../utils/constants.js";

export default {
  /**
   * /payments [POST]
   * @returns HttpStatus created and @Payment
   */
  create: async (req, res, next) => {
    try {
      const sendEmail = req.query.sendEmail === "true" && req.body.type === PAYMENT_TYPES.CASH;
      const createdPayment = await paymentService.create(req.body, req.user.id, sendEmail);
      res.status(StatusCodes.CREATED).json(createdPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id} [GET]
   * @returns HttpStatus and @Payment
   */
  getById: async (req, res, next) => {
    try {
      const createdPayment = await paymentService.getById(req.params.id);
      res.status(StatusCodes.CREATED).json(createdPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/secretary [POST]
   * @returns HttpStatus created and @SecretaryPayment
   */
  createSecretaryPayment: async (req, res, next) => {
    try {
      const secretaryPaymentCreated = await paymentService.createSecretaryPayment(req.body);
      res.status(StatusCodes.CREATED).json(secretaryPaymentCreated);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id}/split [POST]
   * @returns HttpStatus created and @Payment
   */
  splitPayment: async (req, res, next) => {
    try {
      const newPayment = await paymentService.splitPayment(req.params.id, req.body);
      res.status(StatusCodes.CREATED).json(newPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/services [POST]
   * @returns HttpStatus created and @ServicePayment
   */
  createServicePayment: async (req, res, next) => {
    try {
      const servicePaymentCreated = await paymentService.createServicePayment(req.body);
      res.status(StatusCodes.CREATED).json(servicePaymentCreated);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/services [GET]
   * @returns HttpStatus OK and list of @SecretaryPayment
   */
  getServicesPayments: async (req, res, next) => {
    try {
      const servicePayments = await paymentService.getServicePayments(req.body);
      res.status(StatusCodes.OK).json(servicePayments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/services/{id} [PUT]
   * @returns HttpStatus OK and @SecretaryPayment updated
   */
  updateServicePayment: async (req, res, next) => {
    try {
      const updatedServicePayment = await paymentService.updatedServicePayment(req.params.id, req.body);
      res.status(StatusCodes.OK).json(updatedServicePayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/services/{id} [DELETE]
   * @returns HttpStatus 201 no content
   */
  deleteServicePayment: async (req, res, next) => {
    try {
      await paymentService.deleteServicePayment(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/secretary [GET]
   * @returns HttpStatus ok aray of @SecretaryPayment
   */
  getSecretaryPayments: async (req, res, next) => {
    try {
      const secretaryPayments = await paymentService.getSecretaryPayments();
      res.status(StatusCodes.OK).json(secretaryPayments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/secretary/latest [GET]
   * @returns HttpStatus ok and @SecretaryPayment
   */
  getLatestSecretaryPayment: async (req, res, next) => {
    try {
      const secretaryPayment = await paymentService.getLatestSecretaryPayment();
      res.status(StatusCodes.OK).json(secretaryPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id} [DELETE]
   * @returns HttpStatus no content if was deleted
   */
  deleteById: async (req, res, next) => {
    try {
      await paymentService.deleteById(req.params.id, req.user.id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/students/{studentId} [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllByStudentId: async (req, res, next) => {
    try {
      const payments = await paymentService.getAllByStudentId(req.params.studentId);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/courses/{courseId} [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllByCourseId: async (req, res, next) => {
    try {
      const payments = await paymentService.getAllByCourseId(req.params.courseId);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAll: async (req, res, next) => {
    try {
      const { q, page, size } = req.query;
      const querySpecification = q;
      const isOrOperation = req.query.isOrOperation === "true";
      const specification = new Specification(querySpecification, payment, isOrOperation);
      const payments = await paymentService.getAll(page, size, specification);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/verified [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllVerified: async (req, res, next) => {
    try {
      const { q, page, size, all } = req.query;
      const querySpecification = q;
      const isOrOperation = req.query.isOrOperation === "true";
      const specification = new Specification(querySpecification, payment, isOrOperation);
      const payments = await paymentService.getAllVerified(page, size, specification, all);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/unverified [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  getAllUnverified: async (req, res, next) => {
    try {
      const { q, page, size, all } = req.query;
      const querySpecification = q;
      const isOrOperation = req.query.isOrOperation === "true";
      const specification = new Specification(querySpecification, payment, isOrOperation);
      const payments = await paymentService.getAllUnverified(page, size, specification, all);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * @deprecated Tenemos que borrar este endpoint cuando el frontend lo deje de usar. Consume muchos recursos.
   * /payments [GET]
   * @returns HttpStatus ok and array of @Payment
   */
  legacyGetAll: async (req, res, next) => {
    try {
      const querySpecification = req.query.q;
      const isOrOperation = req.query.isOrOperation === "true";
      const specification = new Specification(querySpecification, payment, isOrOperation);
      const payments = await paymentService.legacyGetAll(specification);
      res.status(StatusCodes.OK).json(payments);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id} [PUT]
   * @returns HttpStatus ok and @Payment updated
   */
  updatePayment: async (req, res, next) => {
    try {
      const sendEmail = req.query.sendEmail === "true" && req.body.type === PAYMENT_TYPES.CASH;
      const updatedPayment = await paymentService.updatePayment(req.params.id, req.body, req.user.id, sendEmail);
      res.status(StatusCodes.OK).json(updatedPayment);
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/{id}/verified [PUT]
   * @returns HttpStatus ok
   */
  changeVerified: async (req, res, next) => {
    try {
      await paymentService.changeVerified(req.params.id, req.body.verified, req.user.id);
      res.status(StatusCodes.OK).json();
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/:id/receipt [GET]
   * Descarga el comprobante PDF de un pago
   */
  getReceipt: async (req, res, next) => {
    try {
      const pdfBuffer = await paymentService.getReceipt(req.params.id, req.user);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=recibo_${req.params.id}.pdf`);
      res.send(Buffer.from(pdfBuffer));
    } catch (e) {
      next(e);
    }
  },

  /**
   * /payments/mercadopago/preference [POST]
   * Crear preferencia de pago de MercadoPago
   * @returns HttpStatus created and preference data
   */
  createMercadoPagoPreference: async (req, res, next) => {
    try {
      const { studentId, courseId, year, month, value, discount, sendNotification = false, } = req.body;
      
      // Validar datos requeridos
      const errors = [];
      
      if (!studentId) errors.push("studentId required");
      if (!courseId) errors.push("courseId required");
      if (!year) errors.push("year required");
      if (!month) errors.push("month requireed");
      if (!value) errors.push("value required");
      
      // Validar que sean números mayores a 0
      if (studentId && (isNaN(studentId) || parseInt(studentId) < 0)) {
        errors.push("studentId must be greater than 0");
      }
      if (courseId && (isNaN(courseId) || parseInt(courseId) <= 0)) {
        errors.push("courseId must be greater than 0");
      }
      if (year && (isNaN(year) || parseInt(year) <= 0)) {
        errors.push("year must be greater than 0");
      }
      if (month && (isNaN(month) || parseInt(month) <= 0 || parseInt(month) > 12)) {
        errors.push("month must be between 1 and 12");
      }
      if (value && (isNaN(value) || parseFloat(value) <= 0)) {
        errors.push("value must be greater than 0");
      }
      if (discount != null) {
        if (isNaN(discount) || parseFloat(discount) < 0)
          errors.push("discount must be greater than 0");
      }
      
      if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "validation errors",
          details: errors
        });
      }

      const preference = await mercadoPagoService.createPaymentPreference({
        studentId,
        courseId,
        year,
        month,
        value,
        discount: discount || 0,
        sendNotification,
        informerId: req.user.id,
      });

      res.status(StatusCodes.CREATED).json(preference);
    } catch (e) {
      // Manejar errores específicos con códigos de estado
      if (e.statusCode === 404) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: e.message
        });
      }
      next(e);
    }
  },

  /**
   * /payments/mercadopago/qr [POST]
   * Generar código QR con logo embebido para un link de pago
   * @returns HttpStatus ok with QR image
   */
  generateMercadoPagoQR: async (req, res, next) => {
    try {
      const { paymentLink } = req.body;
      
      if (!paymentLink) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "El link de pago es requerido"
        });
      }

      // Generar QR con logo embebido
      const qrBuffer = await mercadoPagoService.generateQRWithLogo(paymentLink);
      
      // Enviar la imagen como respuesta
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': qrBuffer.length
      });
      
      res.send(qrBuffer);
    } catch (e) {
      console.error('Error generating QR:', e);
      next(e);
    }
  },

  /**
   * /payments/mercadopago/preference/:id/qr [GET]
   * Generar código QR para una preferencia existente
   * @returns HttpStatus ok with QR image
   */
  generateMercadoPagoQRById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "El ID de la preferencia es requerido"
        });
      }

      // Buscar la preferencia en la base de datos
      const preference = await mercadoPagoService.getMercadoPagoPaymentById(id);
      
      if (!preference) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "Preferencia de pago no encontrada"
        });
      }

      // Verificar que existe el link de la preferencia
      const paymentLink = preference.preferenceLink;
      if (!paymentLink) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "id required"
        });
      }

      // Generar QR con el link de la preferencia
      const qrBuffer = await mercadoPagoService.generateQRWithLogo(paymentLink);
      
      // Enviar la imagen como respuesta
      res.set({
        "Content-Type": "image/png",
        "Content-Length": qrBuffer.length
      });
      
      res.send(qrBuffer);
    } catch (e) {
      console.error("Error generating QR by ID:", e);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Error interno del servidor al generar el código QR"
      });
    }
  },

  /**
   * Envía un email con el link de pago de MercadoPago usando el ID de la preferencia
   */
  sendMercadoPagoEmailById: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "id required"
        });
      }

      // Buscar la preferencia en la base de datos
      const preference = await mercadoPagoService.getMercadoPagoPaymentById(id);
      
      if (!preference) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "preference not found"
        });
      }

      // Verificar que existe el link de la preferencia
      const paymentLink = preference.preferenceLink;
      if (!paymentLink) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "invalid preference link"
        });
      }

      // Buscar datos del estudiante para obtener el email
      const student = await getById(preference.studentId);
      if (!student) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: "Estudiante no encontrado"
        });
      }

      if (!student.email) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "no email found in student"
        });
      }

      // Enviar email
      await mercadoPagoService.sendPaymentEmail({
        paymentLink,
        studentEmail: student.email,
        studentName: preference.studentName,
        courseName: preference.courseTitle,
        monthName: preference.monthName,
        year: preference.year,
        amount: preference.value - (preference.discount || 0)
      });

      res.status(StatusCodes.OK).json({
        message: "Email enviado exitosamente",
        email: student.email
      });
    } catch (e) {
      console.error("Error sending email by ID:", e);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Error interno del servidor al enviar el email"
      });
    }
  },

  /**
   * Envía un email con el link de pago de MercadoPago
   */
  sendMercadoPagoEmail: async (req, res, next) => {
    try {
      const { paymentLink, studentEmail, studentName, courseName, monthName, year, amount } = req.body;
      
      if (!paymentLink || !studentEmail) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "El link de pago y email del estudiante son requeridos"
        });
      }

      // Enviar email
      await mercadoPagoService.sendPaymentEmail({
        paymentLink,
        studentEmail,
        studentName,
        courseName,
        monthName,
        year,
        amount: amount || 0
      });
      
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Email enviado correctamente"
      });
    } catch (e) {
      console.error('Error sending email:', e);
      next(e);
    }
  },

  /**
   * /payments/mercadopago/webhook [POST]
   * Webhook para notificaciones de MercadoPago
   * @returns HttpStatus ok
   */
  mercadoPagoWebhook: async (req, res, next) => {
    try {
      const result = await mercadoPagoService.processWebhookNotification({
        headers: req.headers,
        body: req.body,
        query: req.query
      });

      res.status(StatusCodes.OK).json({ 
        received: true, 
        timestamp: new Date().toISOString(),
        processed: result
      });
    } catch (e) {
      console.error("Error processing webhook:", e);
      next(e);
    }
  },

  /**
   * /payments/mercadopago/webhook-info [GET]
   * Obtener información de webhooks recibidos (para debugging)
   * @returns HttpStatus ok
   */
  getWebhookInfo: async (req, res, next) => {
    try {
      const webhookInfo = await mercadoPagoService.getWebhookHistory();
      res.status(StatusCodes.OK).json(webhookInfo);
    } catch (e) {
      next(e);
    }
  }
};