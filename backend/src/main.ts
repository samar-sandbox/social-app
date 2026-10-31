import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import { errorHandler, localization, rateLimiter } from "./common/middlewares";
import { connectDatabase } from "./database/db.connection";
import { authController, userController } from "./modules";
import { mailService } from "./common/services/mail/mail.service";
import { redisService } from "./common/services/redis/redis.service";

const port = config.port;

const app = express();

app.use(express.json());

app.use(cors({ origin: config.origins }), helmet());

app.set("trust proxy", true);
app.use(rateLimiter);

app.use(localization);

app.use("/uploads", express.static("uploads"));

app.get("/", (_req, res) => {
  return res.json({ message: "Social App API is running" });
});
app.get("/health", (_req, res) => {
  return res.json({ success: true });
});

app.use("/auth", authController);
app.use("/users", userController);

app.use("/*splat", (req, res) => {
  const path = req.params.splat;
  const method = req.method;

  return res.status(404).json({
    success: false,
    message: `Route ${method} ${path.join("/")} not found`,
  });
});

app.use(errorHandler);

async function initConnection() {
  await Promise.all([
    connectDatabase(),
    redisService.connect(),
    mailService.verifyConnection(),
  ]);
}

initConnection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(`Error init connections: ${error}`);
  });
