export * from "./user.enum";

export enum AUTH_PROVIDER {
  LOCAL = "local",
  GOOGLE = "google",
}

export enum LOGOUT_MODE {
  DEVICE = "0",
  ALL = "1",
}

export enum MAIL_SUBJECT {
  CONFIRMATION = "CONFIRMATION",
  RESET_PASSWORD = "RESET_PASSWORD",
  VERIFICATION = "VERIFICATION",
}

export enum FILE_TYPE {
  FILE = "file",
  IMAGE = "image",
}

export enum LANG {
  EN = "en",
  AR = "ar",
}

export enum MULTER_STORAGE {
  DISK,
  MEMORY,
}
