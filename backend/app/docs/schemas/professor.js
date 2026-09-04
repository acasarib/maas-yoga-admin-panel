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
 *         firstName:
 *           type: string
 *           description: Nombre del profesor
 *         lastName:
 *           type: string
 *           description: Apellido del profesor
 *         email:
 *           type: string
 *           format: email
 *           description: Email del profesor
 *         document:
 *           type: integer
 *           description: Número de documento
 *         phoneNumber:
 *           type: string
 *           description: Teléfono
 *         cellPhoneNumber:
 *           type: string
 *           description: Celular
 *         address:
 *           type: string
 *           description: Dirección
 *         cuit:
 *           type: string
 *           description: CUIT del profesor
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *     ProfessorCreateRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         document:
 *           type: integer
 *         phoneNumber:
 *           type: string
 *         cellPhoneNumber:
 *           type: string
 *         address:
 *           type: string
 *         cuit:
 *           type: string
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *     ProfessorUpdateRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         document:
 *           type: integer
 *         phoneNumber:
 *           type: string
 *         cellPhoneNumber:
 *           type: string
 *         address:
 *           type: string
 *         cuit:
 *           type: string
 */
