import * as dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
const app = express();
import errorHandler from "./app/middleware/errorHandler.js";
import routes from "./app/routes/index.js";
import cors from "cors";

const allowedOrigins = process.env.ALLOWED_ORIGINS || "*";
const port = process.env.BACKEND_PORT || 3000;

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(json());

app.use("/api/v1", routes);

import { sequelize } from "./app/db/index.js";
import createFirstUserIfNotExists from "./app/seeders/firstUserSeed.js";

try {
  await sequelize.sync({ alter: true });
  console.log("Connection to db successful");
  createFirstUserIfNotExists();
} catch(e) {
  console.log("Could not connect db");
  console.log(e);
}
app.use(errorHandler);
app.listen(port, () => console.log(`listening on port ${port}`));
