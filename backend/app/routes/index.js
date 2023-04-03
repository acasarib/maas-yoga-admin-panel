import { Router } from "express";
import healthcheckRouter from "./healthcheckRoute.js";
import usersRoute from "./usersRoute.js";
import coursesRoute from "./coursesRoute.js";
import studentsRoute from "./studentsRoute.js";
import paymentsRoute from "./paymentsRoute.js";
import filesRoute from "./filesRoute.js";
import tasksRoute from "./tasksRoute.js";
import headquartersRoute from "./headquartersRoute.js";
import templatesRoute from "./templatesRoute.js";
import clazzesRoute from "./clazzesRoute.js";

const router = Router();

router.use("/healthcheck", healthcheckRouter);
router.use("/headquarters", headquartersRoute);
router.use("/users", usersRoute);
router.use("/courses", coursesRoute);
router.use("/students", studentsRoute);
router.use("/payments", paymentsRoute);
router.use("/files", filesRoute);
router.use("/tasks", tasksRoute);
router.use("/templates", templatesRoute);
router.use("/clazzes", clazzesRoute);

export default router;
