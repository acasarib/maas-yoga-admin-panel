import { Router } from "express";
import healthcheckRouter from "./healthcheckRoute.js";
import usersRoute from "./usersRoute.js";
import coursesRoute from "./coursesRoute.js";
import studentsRoute from "./studentsRoute.js";
import paymentsRoute from "./paymentsRoute.js";
import filesRoute from "./filesRoute.js";

const router = Router();

router.use("/healthcheck", healthcheckRouter);
router.use("/users", usersRoute);
router.use("/courses", coursesRoute);
router.use("/students", studentsRoute);
router.use("/payments", paymentsRoute);
router.use("/files", filesRoute);

export default router;
