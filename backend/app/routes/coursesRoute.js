import express from "express";
import controller from "../controllers/coursesController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.deleteById);
router.put("/:id", verifyToken, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/", verifyToken, controller.getAll);
router.put("/:id/students", verifyToken, controller.setStudentsToCourse);

router.post("/:courseId/tasks", verifyToken, controller.addCourseTask);
router.put("/tasks/:id", verifyToken, controller.editCourseTask);
router.delete("/tasks/:id", verifyToken, controller.deleteCourseTask);
router.get("/:courseId/tasks", verifyToken, controller.getCourseTasks);

export default router;
