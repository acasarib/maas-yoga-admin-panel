import express from "express";
import controller from "../controllers/coursesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

router.get("/tasks", verifyToken, controller.getCoursesTasksByTitle);
router.post("/tasks/copy", verifyToken, blockAuditors, controller.copyTasksFromCourse);
router.post("/", verifyToken, blockAuditors, controller.create);
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);
router.put("/:id", verifyToken, blockAuditors, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/", verifyToken, controller.getAll);
router.put("/:id/students", verifyToken, blockAuditors, controller.setStudentsToCourse);
router.put("/:id/students/:studentId/update-inscription-date", verifyToken, blockAuditors, controller.updateInscriptionDate);

router.post("/:courseId/tasks", verifyToken, blockAuditors, controller.addCourseTask);
router.put("/tasks/:id", verifyToken, blockAuditors, controller.editCourseTask);
router.delete("/tasks/:id", verifyToken, blockAuditors, controller.deleteCourseTask);
router.get("/:courseId/tasks/:taskId", verifyToken, controller.getCourseTaskById);
router.get("/:courseId/tasks", verifyToken, controller.getCourseTasks);

router.put("/tasks/:courseTaskId/students", verifyToken, blockAuditors, controller.setStudentsToTask);
router.get("/tasks/:courseTaskId/students", verifyToken, controller.getStudentsTasks);
router.put("/tasks/:courseTaskId/students/:studentId", verifyToken, blockAuditors, controller.setCompletedStudentTask);

router.post("/calc-professors-payments", verifyToken, blockAuditors, controller.calcProfessorsPayments);
router.post("/export-professors-payments", verifyToken, blockAuditors, controller.exportProfessorsPayments);
router.post("/add-professor-payment", verifyToken, blockAuditors, controller.addProfessorPayment);
router.get("/:courseId/export-students", verifyToken, controller.exportStudentsByCourse);

export default router;
