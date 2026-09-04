/**
 * @swagger
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del archivo
 *         filename:
 *           type: string
 *           description: Nombre del archivo
 *         mimetype:
 *           type: string
 *           description: Tipo MIME del archivo
 *         size:
 *           type: integer
 *           description: Tamaño del archivo en bytes
 *         path:
 *           type: string
 *           description: Ruta del archivo
 *         uploadedBy:
 *           type: string
 *           description: ID del usuario que subió el archivo
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - filename
 *         - mimetype
 *     FileUploadRequest:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *           format: binary
 *           description: El archivo a subir
 *       required:
 *         - file
 */
