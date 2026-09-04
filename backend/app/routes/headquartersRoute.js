import express from "express";
import controller from "../controllers/headquartersController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/headquarters:
 *   get:
 *     summary: Obtener todas las sedes
 *     tags: [Headquarters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sedes
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
 *                     $ref: '#/components/schemas/Headquarter'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/headquarters:
 *   post:
 *     summary: Crear una nueva sede
 *     tags: [Headquarters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeadquarterCreateRequest'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/headquarters/{id}:
 *   get:
 *     summary: Obtener sede por ID
 *     tags: [Headquarters]
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
 * /api/v1/headquarters/{id}:
 *   put:
 *     summary: Actualizar sede por ID
 *     tags: [Headquarters]
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
 *             $ref: '#/components/schemas/HeadquarterUpdateRequest'
 */
router.put("/:id", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/headquarters/{id}:
 *   delete:
 *     summary: Eliminar sede por ID
 *     tags: [Headquarters]
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

router.put("/:id/courses", verifyToken, blockAuditors, controller.setCoursesToHeadquarter);

export default router;
