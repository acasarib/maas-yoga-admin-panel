import express from "express";
import controller from "../controllers/paymentsController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.deleteById);
router.get("/students/:studentId", verifyToken, controller.getAllByStudentId);
router.get("/courses/:courseId", verifyToken, controller.getAllByCourseId);
router.put("/:id", verifyToken, controller.updatePayment);
router.put("/:id/verified", verifyToken, controller.changeVerified);
router.get("/", verifyToken, controller.getAll);

export default router;
