import { Router } from "express";
import healthcheckRouter from "./healthcheckRoute.js";
import usersRoute from "./usersRoute.js";

const router = Router();

router.use("/healthcheck", healthcheckRouter);
router.use("/users", usersRoute);

export default router;
