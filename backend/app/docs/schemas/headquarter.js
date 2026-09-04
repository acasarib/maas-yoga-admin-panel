/**
 * @swagger
 * components:
 *   schemas:
 *     Headquarter:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la sede
 *         name:
 *           type: string
 *           description: Nombre de la sede
 *         address:
 *           type: string
 *           description: Dirección de la sede
 *         phone:
 *           type: string
 *           description: Teléfono de la sede
 *         email:
 *           type: string
 *           format: email
 *           description: Email de la sede
 *         city:
 *           type: string
 *           description: Ciudad de la sede
 *         province:
 *           type: string
 *           description: Provincia de la sede
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *     HeadquarterCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         city:
 *           type: string
 *         province:
 *           type: string
 *       required:
 *         - name
 *     HeadquarterUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         city:
 *           type: string
 *         province:
 *           type: string
 */
