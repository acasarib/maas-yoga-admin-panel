/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la notificación
 *         message:
 *           type: string
 *           description: Mensaje de la notificación
 *         type:
 *           type: string
 *           description: Tipo de notificación
 *         read:
 *           type: boolean
 *           default: false
 *           description: Si la notificación ha sido leída
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID del usuario destinatario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - message
 *         - type
 *         - userId
 *     NotificationCreateRequest:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         type:
 *           type: string
 *         userId:
 *           type: string
 *           format: uuid
 *       required:
 *         - message
 *         - type
 *         - userId
 */
