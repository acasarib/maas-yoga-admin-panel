import express from "express";
import controller from "../controllers/categoriesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
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
 *                     $ref: '#/components/schemas/Category'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id/", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Actualizar categoría por ID
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/CategoryUpdateRequest'
 */
router.put("/:id/", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría por ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete("/:id/", verifyToken, blockAuditors, controller.deleteById);

router.get("/items", verifyToken, controller.getAllItems);

export default router;
