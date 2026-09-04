import express from "express";
import controller from "../controllers/clazzesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/classes:
 *   get:
 *     summary: Obtener todas las clases
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clases
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
 *                     $ref: '#/components/schemas/Clazz'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/classes:
 *   post:
 *     summary: Crear una nueva clase
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClazzCreateRequest'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   get:
 *     summary: Obtener clase por ID
 *     tags: [Classes]
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
 * /api/v1/classes/{id}:
 *   put:
 *     summary: Actualizar clase por ID
 *     tags: [Classes]
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
 *             $ref: '#/components/schemas/ClazzUpdateRequest'
 */
router.put("/:id", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/classes/{id}:
 *   delete:
 *     summary: Eliminar clase por ID
 *     tags: [Classes]
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

export default router;
