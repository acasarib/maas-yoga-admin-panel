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

router.put("/tasks/:courseTaskId/students", verifyToken, controller.setStudentsToTask);
router.get("/tasks/:courseTaskId/students", verifyToken, controller.getStudentsTasks);
router.put("/tasks/:courseTaskId/students/:studentId", verifyToken, controller.setCompletedStudentTask);

router.post("/calc-professors-payments", verifyToken, controller.calcProfessorsPayments);
router.post("/add-professor-payment", verifyToken, controller.addProfessorPayment);

export default router;
