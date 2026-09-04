/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la plantilla
 *         name:
 *           type: string
 *           description: Nombre de la plantilla
 *         subject:
 *           type: string
 *           description: Asunto del email
 *         body:
 *           type: string
 *           description: Cuerpo del email (HTML)
 *         description:
 *           type: string
 *           description: Descripción de la plantilla
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - subject
 *         - body
 *     TemplateCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         subject:
 *           type: string
 *         body:
 *           type: string
 *         description:
 *           type: string
 *       required:
 *         - name
 *         - subject
 *         - body
 *     TemplateUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         subject:
 *           type: string
 *         body:
 *           type: string
 *         description:
 *           type: string
 */
