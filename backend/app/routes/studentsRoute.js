import express from "express";
import controller from "../controllers/studentsController.js";
import verifyToken from "../middleware/validateToken.js";
import verifyTokenOrApiKey from "../middleware/verifyTokenOrApiKey.js";
import blockAuditors from "../middleware/withRole.js";
import withApiKeyPermission from "../middleware/withApiKeyPermission.js";
import { body } from "express-validator";
import { API_KEY_PERMISSIONS } from "../utils/constants.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/students:
 *   get:
 *     summary: Obtener todos los estudiantes
 *     tags: [Students]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca coincidencias parciales en nombre, apellido o email del estudiante
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   example: 3522
 *                 totalPages:
 *                   type: integer
 *                   example: 353
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 */
router.get("/", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.STUDENT_READ), controller.getAll);

router.post("/", body("email").isEmail(), verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/students/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 *     tags: [Students]
 *     security:
 *       - apiKeyAuth: []
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
 *               $ref: '#/components/schemas/Student'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 *       404:
 *         description: Estudiante no encontrado
 */
router.get("/:id", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.STUDENT_READ), controller.getById);

router.put("/:id", body("email").isEmail(), verifyToken, blockAuditors, controller.editById);

router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

router.get("/courses/:courseId", verifyToken, controller.getStudentsByCourse);

router.put("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.suspendStudentFromCourse);

router.delete("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.deleteSuspendStudentFromCourse);

router.post("/exists", verifyToken, controller.exists);
router.get("/legacy", verifyToken, controller.getAllLegacy);
router.get("/search", verifyToken, controller.search);
router.get("/:id/payments/pending", verifyToken, controller.pendingPaymentsByStudentId);
router.get("/payments/pending", verifyToken, controller.pendingPayments);

export default router;
