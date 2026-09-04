import express from "express";
import controller from "../controllers/studentsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
import { body } from "express-validator";
const router = express.Router();

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Obtener todos los estudiantes
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/students:
 *   post:
 *     summary: Crear un nuevo estudiante
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentCreateRequest'
 *     responses:
 *       201:
 *         description: Estudiante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Error de validación
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", body("email").isEmail(), verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Datos del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Estudiante no encontrado
 */
router.get("/:id", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   put:
 *     summary: Actualizar estudiante por ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentUpdateRequest'
 *     responses:
 *       200:
 *         description: Estudiante actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Estudiante no encontrado
 */
router.put("/:id", body("email").isEmail(), verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   delete:
 *     summary: Eliminar estudiante por ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Estudiante eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Estudiante no encontrado
 */
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

/**
 * @swagger
 * /api/v1/students/courses/{courseId}:
 *   get:
 *     summary: Obtener estudiantes de un curso
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de estudiantes del curso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/courses/:courseId", verifyToken, controller.getStudentsByCourse);

/**
 * @swagger
 * /api/v1/students/{studentId}/courses/{courseId}/suspend:
 *   put:
 *     summary: Suspender estudiante de un curso
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suspendedAt:
 *                 type: string
 *                 format: date-time
 *               suspendedEndAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Estudiante suspendido exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.suspendStudentFromCourse);

/**
 * @swagger
 * /api/v1/students/{studentId}/courses/{courseId}/suspend:
 *   delete:
 *     summary: Eliminar suspensión de estudiante en un curso
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Suspensión eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.deleteSuspendStudentFromCourse);

router.post("/exists", verifyToken, controller.exists);
router.get("/legacy", verifyToken, controller.getAllLegacy);
router.get("/search", verifyToken, controller.search);
router.get("/:id/payments/pending", verifyToken, controller.pendingPaymentsByStudentId);
router.get("/payments/pending", verifyToken, controller.pendingPayments);

export default router;
