import express from "express";
import controller from "../controllers/notificationsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/notifications/payments:
 *   get:
 *     summary: Obtener notificaciones de pagos
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get("/payments", verifyToken, controller.getAllNotificationPayments);

/**
 * @swagger
 * /api/v1/notifications/payments/{id}:
 *   post:
 *     summary: Notificar usuario sobre un pago
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.post("/payments/:id", verifyToken, blockAuditors, controller.notifyUser);

/**
 * @swagger
 * /api/v1/notifications/payments/{id}:
 *   delete:
 *     summary: Eliminar notificación de pago
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/payments/:id", verifyToken, blockAuditors, controller.deleteById);

/**
 * @swagger
 * /api/v1/notifications/payments/{id}/all-users:
 *   delete:
 *     summary: Eliminar notificación de pago para todos los usuarios
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/payments/:id/all-users", verifyToken, blockAuditors, controller.deleteByIdAllUsers);

export default router;
