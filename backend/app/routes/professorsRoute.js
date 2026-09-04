import express from "express";
import controller from "../controllers/professorsController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

router.get("/pending-payments", verifyToken, controller.getPendingPayments);
router.post("/", verifyToken, blockAuditors, controller.create);
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);
router.put("/:id", verifyToken, blockAuditors, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/", verifyToken, controller.getAll);

export default router;
