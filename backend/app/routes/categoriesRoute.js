import express from "express";
import controller from "../controllers/categoriesController.js";
import verifyToken from "../middleware/validateToken.js";
import blockAuditors from "../middleware/withRole.js";
const router = express.Router();

router.post("/", verifyToken, blockAuditors, controller.create);
router.get("/items", verifyToken, controller.getAllItems);
router.get("/:id/", verifyToken, controller.getById);
router.put("/:id/", verifyToken, blockAuditors, controller.editById);
router.get("/", verifyToken, controller.getAll);
router.delete("/:id/", verifyToken, blockAuditors, controller.deleteById);

export default router;
