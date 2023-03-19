import express from "express";
import controller from "../controllers/headquartersController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.delete("/:id", verifyToken, controller.deleteById);
router.put("/:id", verifyToken, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/", verifyToken, controller.getAll);
router.put("/:id/courses", verifyToken, controller.setCoursesToHeadquarter);

export default router;
