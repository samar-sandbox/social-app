import type { Request, Response, NextFunction } from "express";
import { LANG } from "../enums";

export function localization(req: Request, _res: Response, next: NextFunction) {
  const lang =
    (req.headers["accept-language"]?.toLowerCase() as LANG) ?? LANG.EN;

  const supportedLangs = Object.values(LANG);
  if (!supportedLangs.includes(lang)) {
    req.lang = LANG.EN;
  } else {
    req.lang = lang;
  }

  next();
}
