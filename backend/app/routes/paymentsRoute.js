import express from "express";
import controller from "../controllers/paymentsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Obtener todos los pagos
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos
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
 *                     $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/", verifyToken, controller.getAll);

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateRequest'
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Error de validación
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/", verifyToken, blockAuditors, controller.create);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Obtener pago por ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Datos del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Pago no encontrado
 */
router.get("/:id", verifyToken, controller.getById);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   put:
 *     summary: Actualizar pago por ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentUpdateRequest'
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Pago no encontrado
 */
router.put("/:id", verifyToken, blockAuditors, controller.updatePayment);

/**
 * @swagger
 * /api/v1/payments/{id}:
 *   delete:
 *     summary: Eliminar pago por ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pago
 *     responses:
 *       200:
 *         description: Pago eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Pago no encontrado
 */
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);

/**
 * @swagger
 * /api/v1/payments/{id}/verified:
 *   put:
 *     summary: Cambiar estado verificado del pago
 *     tags: [Payments]
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
 *             type: object
 *             properties:
 *               verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put("/:id/verified", verifyToken, blockAuditors, controller.changeVerified);

router.post("/secretary", verifyToken, blockAuditors, controller.createSecretaryPayment);
router.post("/services", verifyToken, blockAuditors, controller.createServicePayment);
router.get("/services", verifyToken, controller.getServicesPayments);
router.put("/services/:id", verifyToken, blockAuditors, controller.updateServicePayment);
router.delete("/services/:id", verifyToken, blockAuditors, controller.deleteServicePayment);
router.get("/secretary", verifyToken, controller.getSecretaryPayments);
router.get("/secretary/lastest", verifyToken, controller.getLatestSecretaryPayment);
router.get("/students/:studentId", verifyToken, controller.getAllByStudentId);
router.get("/courses/:courseId", verifyToken, controller.getAllByCourseId);
router.post("/:id/split", verifyToken, blockAuditors, controller.splitPayment);
router.post("/invoice", verifyToken, blockAuditors, controller.emitirFactura);
router.get("/:id/invoice/pdf", verifyToken, controller.downloadInvoicePDF);
router.post("/:id/invoice/email", verifyToken, blockAuditors, controller.sendInvoiceByEmail);
router.get("/chart", verifyToken, controller.getForChart);
router.get("/legacy", verifyToken, controller.legacyGetAll);
router.get("/verified", verifyToken, controller.getAllVerified);
router.get("/unverified", verifyToken, controller.getAllUnverified);
router.get("/export", verifyToken, controller.exportPayments);
router.get("/:id/receipt", verifyToken, controller.getReceipt);
router.post("/mercadopago/preference", verifyToken, blockAuditors, controller.createMercadoPagoPreference);
router.get("/mercadopago/preference/:id/qr", controller.generateMercadoPagoQRById);
router.get("/mercadopago/preference/:id/email", controller.sendMercadoPagoEmailById);
router.post("/mercadopago/email", verifyToken, blockAuditors, controller.sendMercadoPagoEmail);
router.post("/mercadopago/webhook", controller.mercadoPagoWebhook);
router.get("/mercadopago/webhook-info", verifyToken, controller.getWebhookInfo);
export default router;
