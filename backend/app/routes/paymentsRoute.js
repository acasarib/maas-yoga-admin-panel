import express from "express";
import controller from "../controllers/paymentsController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.get("/students/:studentId", verifyToken, controller.getAllByStudentId);
router.get("/courses/:courseId", verifyToken, controller.getAllByCourseId);
router.get("/", verifyToken, controller.getAll);

export default router;
