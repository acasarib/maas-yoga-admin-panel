/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pago
 *         type:
 *           type: string
 *           enum: [Efectivo, Transferencia, Mercado Pago, Tarjeta de crédito, Débito de cuenta, Débito de tarjeta, Cheque]
 *           description: Tipo de pago
 *         value:
 *           type: number
 *           format: float
 *           description: Monto del pago
 *         discount:
 *           type: number
 *           format: float
 *           description: Descuento aplicado
 *         at:
 *           type: string
 *           format: date-time
 *           description: Fecha del pago
 *         periodFrom:
 *           type: string
 *           format: date
 *           description: Fecha inicial del período de pago
 *         periodTo:
 *           type: string
 *           format: date
 *           description: Fecha final del período de pago
 *         verified:
 *           type: boolean
 *           default: false
 *           description: Si el pago ha sido verificado
 *         isRegistrationPayment:
 *           type: boolean
 *           default: false
 *           description: Si es un pago de inscripción
 *         note:
 *           type: string
 *           description: Nota adicional del pago
 *         cae:
 *           type: string
 *           description: CAE (Código de Autorización Electrónico) de AFIP
 *         caeVencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento del CAE
 *         invoiceNumber:
 *           type: integer
 *           description: Número de factura
 *         invoiceType:
 *           type: string
 *           enum: [A, B, C]
 *           description: Tipo de factura
 *         studentId:
 *           type: integer
 *           description: ID del estudiante
 *         courseId:
 *           type: integer
 *           description: ID del curso
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - type
 *         - value
 *         - at
 *         - studentId
 *         - courseId
 *     PaymentCreateRequest:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [Efectivo, Transferencia, Mercado Pago, Tarjeta de crédito, Débito de cuenta, Débito de tarjeta, Cheque]
 *         value:
 *           type: number
 *           format: float
 *         discount:
 *           type: number
 *           format: float
 *         at:
 *           type: string
 *           format: date-time
 *         periodFrom:
 *           type: string
 *           format: date
 *         periodTo:
 *           type: string
 *           format: date
 *         isRegistrationPayment:
 *           type: boolean
 *         note:
 *           type: string
 *         studentId:
 *           type: integer
 *         courseId:
 *           type: integer
 *       required:
 *         - type
 *         - value
 *         - at
 *         - studentId
 *         - courseId
 *     PaymentUpdateRequest:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [Efectivo, Transferencia, Mercado Pago, Tarjeta de crédito, Débito de cuenta, Débito de tarjeta, Cheque]
 *         value:
 *           type: number
 *           format: float
 *         discount:
 *           type: number
 *           format: float
 *         at:
 *           type: string
 *           format: date-time
 *         periodFrom:
 *           type: string
 *           format: date
 *         periodTo:
 *           type: string
 *           format: date
 *         verified:
 *           type: boolean
 *         note:
 *           type: string
 */
