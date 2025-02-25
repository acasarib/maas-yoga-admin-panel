import express from "express";
import controller from "../controllers/categoriesController.js";
import verifyToken from "../middleware/validateToken.js";
const router = express.Router();

router.post("/", verifyToken, controller.create);
router.get("/items", verifyToken, controller.getAllItems);
router.get("/:id/", verifyToken, controller.getById);
router.put("/:id/", verifyToken, controller.editById);
router.get("/", verifyToken, controller.getAll);
router.delete("/:id/", verifyToken, controller.deleteById);

export default router;
