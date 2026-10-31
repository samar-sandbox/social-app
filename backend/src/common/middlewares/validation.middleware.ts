import { rm } from "node:fs/promises";
import { z } from "zod";
import type { LANG } from "../enums";
import type { RequestHandler } from "express";
import { BadRequestException } from "../exceptions";

export function validation(schema: (lang: LANG) => z.ZodType): RequestHandler {
  return async function (req, _res, next) {
    const result = schema(req.lang).safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      files: req.paths,
    });

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      if (req.dist) {
        await rm(req.dist, { recursive: true });
      }

      throw new BadRequestException(message);
    }

    req.data = result.data;
    next();
  };
}
