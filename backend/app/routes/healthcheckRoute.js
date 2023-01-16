import express from "express";
import controller from "../controllers/healthcheckController.js";
const router = express.Router();

router.get("/", controller.getHealthcheck);

export default router;
