import express from "express";
import controller from "../controllers/logsController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Obtener todos los logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", verifyToken, controller.getAll);

export default router;
