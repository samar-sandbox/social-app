import { Readable } from "node:stream";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import type { LANG } from "../enums";

export const objectIdSchema = (message = "Invalid ObjectId format") =>
  z.string().refine((val) => isValidObjectId(val), {
    error: message,
  });

export const paginationSchema = (_lang: LANG) =>
  z.object({
    page: z.coerce
      .number("Page must be a valid number")
      .int("Page must be a valid integer")
      .default(1),
    limit: z.coerce
      .number("Limit must be a valid number")
      .int("Limit must be a valid integer")
      .default(10),
  });

export const paginationQuerySchema = (lang: LANG) =>
  z.object({
    query: paginationSchema(lang),
  });

export const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
  destination: z.string().default(""),
  filename: z.string().default(""),
  path: z.string().default(""),
  buffer: z.instanceof(Buffer).default(Buffer.from([])),
  stream: z.instanceof(Readable).default(Readable.from([])),
});

export const uploadSchema = (_lang: LANG) =>
  z.object({
    params: z.object({ path: z.array(z.string()) }),
    query: z.object({
      presigned: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
      download: z
        .enum(["true", "false"])
        .default("false")
        .transform((value) => value === "true"),
      filename: z.string().optional(),
    }),
  });
