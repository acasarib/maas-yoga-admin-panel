import express from "express";
import controller from "../controllers/notificationsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

router.get("/payments", verifyToken, controller.getAllNotificationPayments);
router.delete("/payments/:id", verifyToken, blockAuditors, controller.deleteById);
router.delete("/payments/:id/all-users", verifyToken, blockAuditors, controller.deleteByIdAllUsers);
router.post("/payments/:id", verifyToken, blockAuditors, controller.notifyUser);

export default router;
