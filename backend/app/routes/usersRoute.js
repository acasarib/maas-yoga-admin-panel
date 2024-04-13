import express from "express";
import controller from "../controllers/usersController.js";
import { body } from "express-validator";
import verifyToken from "../middleware/validateToken.js";
import withPermissions from "../middleware/withPermissions.js";
import { PERMISSIONS } from "../utils/constants.js";
const router = express.Router();

router.post("/register", verifyToken, withPermissions(PERMISSIONS.CREATE_USER), body("email").isEmail(), controller.register);
router.delete("/:email", verifyToken, withPermissions(PERMISSIONS.CREATE_USER), controller.deleteByEmail);
router.put("/change-password", verifyToken, controller.changeMyPassword);
router.post("/login", controller.login);
router.get("/", verifyToken, controller.getAll);
router.put("/:email", verifyToken, withPermissions(PERMISSIONS.CREATE_USER), controller.editByEmail);

export default router;
