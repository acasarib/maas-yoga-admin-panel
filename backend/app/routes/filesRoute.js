import express from "express";
import controller from "../controllers/filesController.js";
import verifyToken from "../middleware/validateToken.js";
import upload from "../config/multer.config.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/files:
 *   post:
 *     summary: Subir un archivo
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 */
router.post("/", verifyToken, upload.single("file"), controller.create);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   get:
 *     summary: Descargar archivo por ID
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/:id", controller.getById);

export default router;
