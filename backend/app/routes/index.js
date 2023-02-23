import { Router } from "express";
import healthcheckRouter from "./healthcheckRoute.js";
import usersRoute from "./usersRoute.js";
import coursesRoute from "./coursesRoute.js";
import studentsRoute from "./studentsRoute.js";
import paymentsRoute from "./paymentsRoute.js";
import filesRoute from "./filesRoute.js";
import tasksRoute from "./tasksRoute.js";

const router = Router();

router.use("/healthcheck", healthcheckRouter);
router.use("/users", usersRoute);
router.use("/courses", coursesRoute);
router.use("/students", studentsRoute);
router.use("/payments", paymentsRoute);
router.use("/files", filesRoute);
router.use("/tasks", tasksRoute);

export default router;
