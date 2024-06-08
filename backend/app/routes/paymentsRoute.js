import express from "express";
import controller from "../controllers/paymentsController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.post("/secretary", verifyToken, controller.createSecretaryPayment);
router.post("/services", verifyToken, controller.createServicePayment);
router.get("/services", verifyToken, controller.getServicesPayments);
router.put("/services/:id", verifyToken, controller.updateServicePayment);
router.delete("/services/:id", verifyToken, controller.deleteServicePayment);
router.get("/secretary", verifyToken, controller.getSecretaryPayments);
router.delete("/:id", verifyToken, controller.deleteById);
router.get("/students/:studentId", verifyToken, controller.getAllByStudentId);
router.get("/courses/:courseId", verifyToken, controller.getAllByCourseId);
router.put("/:id", verifyToken, controller.updatePayment);
router.put("/:id/verified", verifyToken, controller.changeVerified);
router.post("/:id/split", verifyToken, controller.splitPayment);
router.get("/", verifyToken, controller.getAll);

export default router;
