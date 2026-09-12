import express from "express";
import controller from "../controllers/healthcheckController.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/healthcheck:
 *   get:
 *     summary: Verificar estado del servicio
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: El servicio está activo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 version:
 *                   type: string
 *                   example: 1.3.6
 */
router.get("/", controller.getHealthcheck);

export default router;
