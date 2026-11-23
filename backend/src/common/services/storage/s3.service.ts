import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import config from "../../../config";
import type {
  IDeleteAssetsResult,
  IGetAssetParams,
  IGetAssetResult,
  IGetFileKey,
  IGetPresignedUrlParams,
  IMultipartUploadParams,
  IUploadAssetParams,
  IUploadAssetsParams,
  IUploadPresignedUrlParams,
} from "./s3.type";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

export class S3Service {
  private client: S3Client;

  constructor() {
    const { region, accessKeyId, secretAccessKey } = config.awsS3;

    this.client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  private getFileKey({
    filename,
    fieldname,
    userId,
    dist,
  }: IGetFileKey): string {
    return `${dist}/${userId}/${fieldname}/${filename}`;
  }

  private async multipartUpload({
    bucket = config.awsS3.bucket,
    file,
    key,
  }: IMultipartUploadParams): Promise<[string, string]> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    upload.on("httpUploadProgress", ({ loaded, total }) => {
      console.log(
        `Upload ${key} progress: ${((loaded as number) / (total as number)) * 100} %`,
      );
    });

    await upload.done();

    return [file.fieldname, key];
  }

  async uploadAsset({
    bucket = config.awsS3.bucket,
    dist = "uploads",
    userId,
    file,
    multipart = false,
  }: IUploadAssetParams): Promise<[string, string]> {
    const key = this.getFileKey({
      filename: file.filename,
      fieldname: file.fieldname,
      dist,
      userId,
    });

    if (multipart) {
      return this.multipartUpload({ bucket, file, key });
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    return [file.fieldname, key];
  }

  async uploadAssets({
    bucket = config.awsS3.bucket,
    dist = "uploads",
    userId,
    files,
    multipart = false,
  }: IUploadAssetsParams): Promise<Record<string, string[]>> {
    const res = await Promise.all(
      files.map((file) =>
        this.uploadAsset({ bucket, dist, userId, file, multipart }),
      ),
    );

    const paths = res.reduce(
      (acc, [fieldname, path]) => {
        if (!acc[fieldname]) {
          acc[fieldname] = [];
        }

        acc[fieldname].push(path);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return paths;
  }

  async deleteAsset(key: string, bucket = config.awsS3.bucket) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async deleteAssets(
    keys: string[],
    bucket = config.awsS3.bucket,
  ): Promise<IDeleteAssetsResult> {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    });

    const { Deleted = [], Errors = [] } = await this.client.send(command);

    const deleted = Deleted.map((d) => d.Key || "");
    const errors = Errors.map((e) => ({
      key: e.Key || "",
      message: e.Message || "",
    }));

    return { deleted, errors };
  }

  async listObjects(
    prefix: string,
    bucket = config.awsS3.bucket,
  ): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const { Contents = [] } = await this.client.send(command);

    return Contents.map((c) => c.Key).filter((key): key is string => !!key);
  }

  async deleteDirContent(
    prefix: string,
    bucket = config.awsS3.bucket,
  ): Promise<IDeleteAssetsResult> {
    const keys = await this.listObjects(prefix, bucket);

    return this.deleteAssets(keys, bucket);
  }

  async getAsset({
    key,
    dist = "uploads",
    bucket = config.awsS3.bucket,
  }: IGetAssetParams): Promise<IGetAssetResult> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${dist}/${key}`,
    });

    const { Body, ContentType } = await this.client.send(command);

    return { body: Body as NodeJS.ReadableStream, contentType: ContentType };
  }

  async getPresignedGetUrl({
    key,
    download,
    filename,
    dist = "uploads",
    bucket = config.awsS3.bucket,
    expiresInSec = 60 * 60, // Default 1 hour
  }: IGetPresignedUrlParams): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: `${dist}/${key}`,
      ResponseContentDisposition: download
        ? `attachment; filename="${filename || key.split("/").pop()}"`
        : undefined,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSec });
  }

  async getPresignedPutUrl({
    userId,
    fieldname,
    filename,
    dist = "uploads",
    bucket = config.awsS3.bucket,
    expiresInSec = 60 * 60, // Default 1 hour
  }: IUploadPresignedUrlParams): Promise<string> {
    const key = this.getFileKey({
      dist,
      userId,
      fieldname,
      filename,
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSec });
  }
}

const s3Service = new S3Service();

export { s3Service };
