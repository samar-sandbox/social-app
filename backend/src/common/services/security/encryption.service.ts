import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import config from "../../../config";

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(config.encryptionKey, "hex");

export function encrypt(text: string) {
  const iv = randomBytes(16);
  const ivHex = iv.toString("hex");

  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let result = cipher.update(text, "utf-8", "hex");
  result += cipher.final("hex");

  return `${ivHex}:${result}`;
}

export function decrypt(text: string) {
  const [ivHex, encrypted] = text.split(":") as [string, string];

  const iv = Buffer.from(ivHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);

  let result = decipher.update(encrypted, "hex", "utf-8");
  result += decipher.final("utf-8");

  return result;
}
