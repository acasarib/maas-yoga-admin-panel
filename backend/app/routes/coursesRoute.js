import express from "express";
import controller from "../controllers/coursesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Obtener todos los cursos
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cursos
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
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/courses:
 *   post:
 *     summary: Crear un nuevo curso
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreateRequest'
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Obtener curso por ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Curso no encontrado
 */
router.get("/:id", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   put:
 *     summary: Actualizar curso por ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdateRequest'
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Curso no encontrado
 */
router.put("/:id", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   delete:
 *     summary: Eliminar curso por ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Curso no encontrado
 */
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

router.get("/tasks", verifyToken, controller.getCoursesTasksByTitle);
router.post("/tasks/copy", verifyToken, blockAuditors, controller.copyTasksFromCourse);
router.put("/:id/students", verifyToken, blockAuditors, controller.setStudentsToCourse);
router.put("/:id/students/:studentId/update-inscription-date", verifyToken, blockAuditors, controller.updateInscriptionDate);

router.post("/:courseId/tasks", verifyToken, blockAuditors, controller.addCourseTask);
router.put("/tasks/:id", verifyToken, blockAuditors, controller.editCourseTask);
router.delete("/tasks/:id", verifyToken, blockAuditors, controller.deleteCourseTask);
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
