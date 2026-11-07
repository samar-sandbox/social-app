import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import config from "../../config";
import { MULTER_STORAGE } from "../enums";
import type { IUploadAssetParams } from "../types";

export class S3Service {
  private client: S3Client;

  constructor() {
    const { region, accessKeyId, secretAccessKey } = config.awsS3;

    this.client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async uploadAsset({
    storage = MULTER_STORAGE.MEMORY,
    bucket,
    ACL = ObjectCannedACL.private,
    path = "uploads",
    file,
  }: IUploadAssetParams): Promise<string> {
    const key = `${path}/${randomUUID()}__${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      ACL,
      Key: key,
      Body:
        storage === MULTER_STORAGE.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    return key;
  }
}

const s3Service = new S3Service();

export { s3Service };
