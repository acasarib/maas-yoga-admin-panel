import express from "express";
import controller from "../controllers/coursesController.js";
import verifyToken from "../middleware/validateToken.js";
import verifyTokenOrApiKey from "../middleware/verifyTokenOrApiKey.js";
import blockAuditors from "../middleware/withRole.js";
import withApiKeyPermission from "../middleware/withApiKeyPermission.js";
import { API_KEY_PERMISSIONS } from "../utils/constants.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Obtener todos los cursos
 *     tags: [Courses]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filtro por título del curso
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
 *     responses:
 *       200:
 *         description: Lista paginada de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 */
router.get("/", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.COURSE_READ), controller.getAll);

router.post("/", verifyToken, blockAuditors, controller.create);

router.get("/tasks", verifyToken, controller.getCoursesTasksByTitle);
router.post("/tasks/copy", verifyToken, blockAuditors, controller.copyTasksFromCourse);
router.put("/tasks/:id", verifyToken, blockAuditors, controller.editCourseTask);
router.delete("/tasks/:id", verifyToken, blockAuditors, controller.deleteCourseTask);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Obtener curso por ID
 *     tags: [Courses]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Datos del curso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 *       404:
 *         description: Curso no encontrado
 */
router.get("/:id", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.COURSE_READ), controller.getById);

router.put("/:id", verifyToken, blockAuditors, controller.editById);

router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

router.put("/:id/students", verifyToken, blockAuditors, controller.setStudentsToCourse);
router.put("/:id/students/:studentId/update-inscription-date", verifyToken, blockAuditors, controller.updateInscriptionDate);

router.post("/:courseId/tasks", verifyToken, blockAuditors, controller.addCourseTask);
router.get("/:courseId/tasks/:taskId", verifyToken, controller.getCourseTaskById);
router.get("/:courseId/tasks", verifyToken, controller.getCourseTasks);

router.put("/tasks/:courseTaskId/students", verifyToken, blockAuditors, controller.setStudentsToTask);
router.get("/tasks/:courseTaskId/students", verifyToken, controller.getStudentsTasks);
router.put("/tasks/:courseTaskId/students/:studentId", verifyToken, blockAuditors, controller.setCompletedStudentTask);

router.post("/calc-professors-payments", verifyToken, blockAuditors, controller.calcProfessorsPayments);
router.post("/export-professors-payments", verifyToken, blockAuditors, controller.exportProfessorsPayments);
router.post("/add-professor-payment", verifyToken, blockAuditors, controller.addProfessorPayment);
router.get("/:courseId/export-students", verifyToken, controller.exportStudentsByCourse);

export default router;
