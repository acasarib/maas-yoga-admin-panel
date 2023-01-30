import express from "express";
import controller from "../controllers/usersController.js";
import { body } from "express-validator";
import verifyToken from "../middleware/validateToken.js";
import withPermissions from "../middleware/withPermissions.js";
import { PERMISSIONS } from "../utils/constants.js";
const router = express.Router();

router.post("/register", verifyToken, withPermissions(PERMISSIONS.CREATE_USER), body("email").isEmail(), controller.register);
router.delete("/:email", controller.deleteByEmail);
router.post("/login", controller.login);

export default router;
