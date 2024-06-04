import * as dotenv from "dotenv";
import fs from "fs";
import https from "https";
import cron from "node-cron";
import { addTodayPaymentServices } from "./app/client/scheduledCronTasks.js";
dotenv.config();
import express, { json } from "express";
const app = express();
import errorHandler from "./app/middleware/errorHandler.js";
import routes from "./app/routes/index.js";
import cors from "cors";

cron.schedule("0 1 * * *", addTodayPaymentServices);

const allowedOrigins = process.env.ALLOWED_ORIGINS || "*";
const port = process.env.BACKEND_PORT || 3000;
const useSsl = process.env.USE_SSL_CERTIFICATE;

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
} catch(e) {
  console.log("Could not connect db");
  console.log(e);
}
createFirstUserIfNotExists();
addTodayPaymentServices();


app.use(errorHandler);

  
if (useSsl === "true") {
  console.log("https");
  try {
    const options = {
      key: fs.readFileSync(process.env.SSL_CERTIFICATE_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH)
    };
    https.createServer(options, app).listen(port);
  } catch(e) {
    console.log(e);
  }
} else {
  console.log("http");
  app.listen(port, () => console.log(`listening on port ${port}`));
}
