import express from "express";
import controller from "../controllers/professorsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/professors:
 *   get:
 *     summary: Obtener todos los profesores
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de profesores
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
 *                     $ref: '#/components/schemas/Professor'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/professors:
 *   post:
 *     summary: Crear un nuevo profesor
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfessorCreateRequest'
 *     responses:
 *       201:
 *         description: Profesor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Professor'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/professors/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/professors/{id}:
 *   put:
 *     summary: Actualizar profesor por ID
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfessorUpdateRequest'
 */
router.put("/:id", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/professors/{id}:
 *   delete:
 *     summary: Eliminar profesor por ID
 *     tags: [Professors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

router.get("/pending-payments", verifyToken, controller.getPendingPayments);

export default router;
