import type { JwtPayload } from "jsonwebtoken";
import type { LANG } from "../enums";

declare module "express-serve-static-core" {
  interface Request {
    lang: LANG;
    dist?: string;
    paths?: Record<string, string[]>;
    user?: JwtPayload;
    data?: unknown;
  }
}
