import type { JwtPayload } from "jsonwebtoken";
import type { LANG } from "../enums";

declare module "express-serve-static-core" {
  interface Request {
    lang: LANG;
    user?: JwtPayload;
    data?: unknown;
  }
}

export type TFile = Express.Multer.File;
