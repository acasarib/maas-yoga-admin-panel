import express from "express";
import controller from "../controllers/studentsController.js";
import verifyToken from "../middleware/validateToken.js";
import { body } from "express-validator";
const router = express.Router();

router.post("/", body("email").isEmail(), verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.deleteById);
router.put("/:id", body("email").isEmail(), verifyToken, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/:id/payments/pending", verifyToken, controller.pendingPaymentsByStudentId);
router.get("/payments/pending", verifyToken, controller.pendingPayments);
router.get("/", verifyToken, controller.getAll);

export default router;
