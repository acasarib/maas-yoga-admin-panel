/**
 * @swagger
 * components:
 *   schemas:
 *     Clazz:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la clase
 *         name:
 *           type: string
 *           description: Nombre de la clase
 *         description:
 *           type: string
 *           description: Descripción de la clase
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *     ClazzCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *       required:
 *         - name
 *     ClazzUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 */
