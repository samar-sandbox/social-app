import express from "express";
import cors from "cors";
import helmet from "helmet";
import config from "./config";
import {
  errorHandler,
  localization,
  rateLimiter,
  validation,
} from "./common/middlewares";
import { connectDatabase } from "./database/db.connection";
import {
  authController,
  userController,
  postController,
  followController,
  commentController,
} from "./modules";
import { mailService } from "./common/services/mail/mail.service";
import { redisService } from "./common/services/redis/redis.service";
import { s3Service } from "./common/services/storage/s3.service";
import { pipeline } from "node:stream";
import { uploadSchema } from "./common/validation";
import { getReqData } from "./common/helpers";
import { TUpload } from "./common/types";

const port = config.port;

const app = express();

app.use(express.json());

app.use(cors({ origin: config.origins }), helmet());

app.set("trust proxy", true);
app.use(rateLimiter);

app.use(localization);

app.get("/", (_req, res) => {
  return res.json({ message: "Social App API is running" });
});
app.get("/health", (_req, res) => {
  return res.json({ success: true });
});

app.use("/auth", authController);
app.use("/users", userController);
app.use("/follow", followController);
app.use("/posts", postController);
app.use("/comments", commentController);

app.get("/uploads/*path", validation(uploadSchema), async (req, res) => {
  const {
    params: { path },
    query: { presigned, download, filename },
  } = getReqData<TUpload>(req);

  const key = path.join("/");

  if (presigned) {
    const url = await s3Service.getPresignedGetUrl({
      key,
      download,
      filename,
    });

    return res.json({
      success: true,
      message: "Presigned URL generated successfully",
      data: { url },
    });
  }

  const { body, contentType } = await s3Service.getAsset({ key });

  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  if (download) {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename || path[path.length - 1]}"`,
    );
  }

  return pipeline(body, res, (err) => {
    if (err) {
      console.error(`Error streaming asset: ${err}`);

      res.status(500).end();
    }
  });
});

app.all("/*splat", (req, res) => {
  const path = req.params.splat.join("/");
  const method = req.method;

  return res.status(404).json({
    success: false,
    message: `Route ${method} /${path} not found`,
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
