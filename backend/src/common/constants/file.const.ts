import { FILE_TYPE } from "../enums";

export const FILE_MIME_TYPES: Record<FILE_TYPE, string[]> = {
  [FILE_TYPE.FILE]: ["application/pdf", "application/json", "text/plain"],
  [FILE_TYPE.IMAGE]: ["image/jpeg", "image/png"],
};
