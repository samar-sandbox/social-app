import type { ObjectCannedACL } from "@aws-sdk/client-s3";
import { MULTER_STORAGE } from "../enums";

export interface IUploadAssetParams {
  file: Express.Multer.File;
  path?: string;
  storage?: MULTER_STORAGE;
  bucket?: string;
  ACL?: ObjectCannedACL;
}
