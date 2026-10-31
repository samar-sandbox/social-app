import type { RequestHandler, Request, Response } from "express";

export function sendResponse<T>(
  handler: (
    req: Request,
    res: Response,
  ) => Promise<T & { status?: number }> | undefined,
): RequestHandler {
  return async function (
    req,
    res,
  ): Promise<Response<T & { success: boolean }> | undefined> {
    const result = await handler(req, res);

    if (!result || res.headersSent) return;

    const { status = 200, ...data } = result;

    return res.status(status).json({ success: true, ...data });
  };
}
