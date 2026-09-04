import express from "express";
import controller from "../controllers/templatesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/templates:
 *   get:
 *     summary: Obtener todas las plantillas
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/templates:
 *   post:
 *     summary: Crear una nueva plantilla
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateCreateRequest'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   get:
 *     summary: Obtener plantilla por ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:id", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   put:
 *     summary: Actualizar plantilla por ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateUpdateRequest'
 */
router.put("/:id", verifyToken, blockAuditors, controller.editById);

/**
 * @swagger
 * /api/v1/templates/{id}:
 *   delete:
 *     summary: Eliminar plantilla por ID
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

export default router;
