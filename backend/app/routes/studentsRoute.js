import express from "express";
import controller from "../controllers/studentsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
import { body } from "express-validator";
const router = express.Router();

router.post("/", body("email").isEmail(), verifyToken, blockAuditors, controller.create);
router.post("/exists", verifyToken, controller.exists);
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);
router.put("/:id", body("email").isEmail(), verifyToken, blockAuditors, controller.editById);
router.get("/legacy", verifyToken, controller.getAllLegacy);
router.get("/search", verifyToken, controller.search);
router.get("/:id", verifyToken, controller.getById);
router.get("/:id/payments/pending", verifyToken, controller.pendingPaymentsByStudentId);
router.get("/payments/pending", verifyToken, controller.pendingPayments);
router.get("/", verifyToken, controller.getAll);
router.get("/courses/:courseId", verifyToken, controller.getStudentsByCourse);
router.put("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.suspendStudentFromCourse);
router.delete("/:studentId/courses/:courseId/suspend", verifyToken, blockAuditors, controller.deleteSuspendStudentFromCourse);

export default router;
