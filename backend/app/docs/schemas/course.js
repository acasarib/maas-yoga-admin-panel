/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del curso
 *         title:
 *           type: string
 *           description: Título del curso
 *         description:
 *           type: string
 *           description: Descripción del curso
 *         startAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de inicio del curso
 *         endAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de fin del curso
 *         isCircular:
 *           type: boolean
 *           default: false
 *           description: Si el curso es circular (sin fecha de fin)
 *         needsRegistration:
 *           type: boolean
 *           default: false
 *           description: Si el curso requiere inscripción pagada
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - title
 *     CourseCreateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startAt:
 *           type: string
 *           format: date-time
 *         endAt:
 *           type: string
 *           format: date-time
 *         isCircular:
 *           type: boolean
 *           default: false
 *         needsRegistration:
 *           type: boolean
 *           default: false
 *       required:
 *         - title
 *     CourseUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startAt:
 *           type: string
 *           format: date-time
 *         endAt:
 *           type: string
 *           format: date-time
 *         isCircular:
 *           type: boolean
 *         needsRegistration:
 *           type: boolean
 */
