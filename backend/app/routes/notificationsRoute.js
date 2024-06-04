import express from "express";
import controller from "../controllers/notificationsController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.get("/payments", verifyToken, controller.getAllNotificationPayments);
router.delete("/payments/:id", verifyToken, controller.deleteById);
router.delete("/payments/:id/all-users", verifyToken, controller.deleteByIdAllUsers);
router.post("/payments/:id", verifyToken, controller.notifyUser);

export default router;
