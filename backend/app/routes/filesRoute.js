import express from "express";
import controller from "../controllers/filesController.js";
import verifyToken from "../middleware/validateToken.js";
import upload from "../config/multer.config.js";
const router = express.Router();

router.post("/", verifyToken, upload.single("file"), controller.create);
router.get("/:id", controller.getById);

export default router;
