import dotenv from "dotenv";
import type { TConfig } from "./config.type";

dotenv.config();

const config: TConfig = {
  dbURI: process.env.DB_URI || "mongodb://localhost:27017/social-app",
  redisURL: process.env.REDIS_URL || "redis://localhost:6379",
  port: parseInt(process.env.PORT || "3000"),
  encryptionKey: process.env.ENCRYPTION_KEY || "",
  userJwtKeys: {
    accessKey: process.env.USER_ACCESS_TOKEN_KEY || "",
    refreshKey: process.env.USER_REFRESH_TOKEN_KEY || "",
  },
  adminJwtKeys: {
    accessKey: process.env.ADMIN_ACCESS_TOKEN_KEY || "",
    refreshKey: process.env.ADMIN_REFRESH_TOKEN_KEY || "",
  },
  jwtExpiresIn: {
    accessKey: parseInt(process.env.JWT_ACCESS_EXPIRES_IN ?? "") || 15 * 60, // 15 min
    refreshKey:
      parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? "") || 24 * 60 * 60, // 1 day
  },
  googleClient: {
    secret: process.env.GOOGLE_CLIENT_SECRET || "",
    webIds: process.env.GOOGLE_CLIENT_IDS?.split(",") || [],
  },
  googleMail: {
    user: process.env.GOOGLE_MAIL_APP_USER || "",
    password: process.env.GOOGLE_MAIL_APP_PASSWORD || "",
  },
  origins: process.env.ORIGINS?.split(",") || [],
  awsS3: {
    region: process.env.AWS_REGION || "",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

export default config;
