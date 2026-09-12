import express from "express";
import controller from "../controllers/professorsController.js";
import verifyToken from "../middleware/validateToken.js";
import verifyTokenOrApiKey from "../middleware/verifyTokenOrApiKey.js";
import blockAuditors from "../middleware/withRole.js";
import withApiKeyPermission from "../middleware/withApiKeyPermission.js";
import { API_KEY_PERMISSIONS } from "../utils/constants.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/professors:
 *   get:
 *     summary: Obtener todos los profesores
 *     tags: [Professors]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Filtro de búsqueda (nombre, apellido, email, etc.)
 *     responses:
 *       200:
 *         description: Lista de profesores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Professor'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 */
router.get("/", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.PROFESSOR_READ), controller.getAll);

router.post("/", verifyToken, blockAuditors, controller.create);

router.get("/pending-payments", verifyToken, controller.getPendingPayments);

/**
 * @swagger
 * /api/v1/professors/{id}:
 *   get:
 *     summary: Obtener profesor por ID
 *     tags: [Professors]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Datos del profesor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Professor'
 *       401:
 *         description: No autorizado. Proporciona un X-Api-Key válido
 *       404:
 *         description: Profesor no encontrado
 */
router.get("/:id", verifyTokenOrApiKey, withApiKeyPermission(API_KEY_PERMISSIONS.PROFESSOR_READ), controller.getById);

router.put("/:id", verifyToken, blockAuditors, controller.editById);

router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

export default router;
