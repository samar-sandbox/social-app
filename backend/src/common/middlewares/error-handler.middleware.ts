import { MulterError } from "multer";
import type { Request, Response, NextFunction } from "express";
import { AppException } from "../exceptions";

export async function errorHandler(
  err: AppException,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<Response> {
  let errMessage: string | MulterError = err.message;
  if (err instanceof MulterError) {
    errMessage = {
      ...err,
      message: err.message,
    };
  }

  return res.status(err.status ?? 500).json({
    success: false,
    message: errMessage,
  });
}
