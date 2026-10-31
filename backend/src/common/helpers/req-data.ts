import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { InternalServerException } from "../exceptions";

export function getReqData<T>(req: Request): T {
  if (!req.data) {
    throw new InternalServerException("No validated data in the request");
  }

  return req.data as T;
}

export function getAuthUser(req: Request): JwtPayload {
  if (!req.user) {
    throw new InternalServerException("No user data in the request");
  }

  return req.user;
}
