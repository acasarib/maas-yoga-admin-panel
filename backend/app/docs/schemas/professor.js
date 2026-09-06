/**
 * @swagger
 * components:
 *   schemas:
 *     Professor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del profesor
 *         name:
 *           type: string
 *           description: Nombre del profesor
 *         lastName:
 *           type: string
 *           description: Apellido del profesor
 *         email:
 *           type: string
 *           format: email
 *           description: Email del profesor
 *         phoneNumber:
 *           type: string
 *           description: Teléfono
 *         invoiceType:
 *           type: string
 *           description: Tipo de facturación del profesor
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - lastName
 *         - email
 *     ProfessorCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         invoiceType:
 *           type: string
 *       required:
 *         - name
 *         - lastName
 *         - email
 *     ProfessorUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phoneNumber:
 *           type: string
 *         invoiceType:
 *           type: string
 */
