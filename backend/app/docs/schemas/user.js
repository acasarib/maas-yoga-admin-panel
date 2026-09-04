/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         status:
 *           type: string
 *           enum: [active, deleted]
 *           description: Estado del usuario
 *         role:
 *           type: string
 *           enum: [admin, operator, auditor]
 *           description: Rol del usuario
 *         permissionCreateUser:
 *           type: boolean
 *           description: Permiso para crear usuarios
 *         permissionGoogleDrive:
 *           type: boolean
 *           description: Permiso para acceder a Google Drive
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *       required:
 *         - email
 *         - password
 *     UserCreateRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *         role:
 *           type: string
 *           enum: [admin, operator, auditor]
 *           description: Rol del usuario
 *         permissionCreateUser:
 *           type: boolean
 *           default: false
 *         permissionGoogleDrive:
 *           type: boolean
 *           default: false
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *         - password
 *     UserUpdateRequest:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, operator, auditor]
 *         permissionCreateUser:
 *           type: boolean
 *         permissionGoogleDrive:
 *           type: boolean
 */
