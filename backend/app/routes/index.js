import { Router } from "express";
import healthcheckRouter from "./healthcheckRoute.js";
import usersRoute from "./usersRoute.js";
import coursesRoute from "./coursesRoute.js";
import studentsRoute from "./studentsRoute.js";

const router = Router();

router.use("/healthcheck", healthcheckRouter);
router.use("/users", usersRoute);
router.use("/courses", coursesRoute);
router.use("/students", studentsRoute);

export default router;
