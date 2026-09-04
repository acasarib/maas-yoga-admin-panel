import express from "express";
import controller from "../controllers/headquartersController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

router.post("/", verifyToken, blockAuditors, controller.create);
router.delete("/:id", verifyToken, blockAuditors, controller.deleteById);
router.put("/:id", verifyToken, blockAuditors, controller.editById);
router.get("/:id", verifyToken, controller.getById);
router.get("/", verifyToken, controller.getAll);
router.put("/:id/courses", verifyToken, blockAuditors, controller.setCoursesToHeadquarter);

export default router;
