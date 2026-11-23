import type { TFile } from "../../types";

export interface IGetFileKey {
  filename: string;
  fieldname: string;
  userId: string;
  dist: string;
}

export interface IUploadParams {
  userId: string;
  dist?: string; // Directory within the bucket where the file will be stored
  bucket?: string;
  multipart?: boolean;
}

export interface IMultipartUploadParams {
  bucket?: string;
  file: TFile;
  key: string;
}

export interface IUploadAssetParams extends IUploadParams {
  file: TFile;
}

export interface IUploadAssetsParams extends IUploadParams {
  files: TFile[];
}

export interface IDeleteAssetsResult {
  deleted: string[];
  errors: { key: string; message: string }[];
}

export interface IGetAssetParams {
  key: string;
  dist?: string;
  bucket?: string;
}

export interface IGetAssetResult {
  body: NodeJS.ReadableStream;
  contentType: string | undefined;
}

export interface IGetPresignedUrlParams extends IGetAssetParams {
  filename: string | undefined;
  download: boolean;
  expiresInSec?: number;
}

export interface IUploadPresignedUrlParams {
  userId: string;
  fieldname: string;
  filename: string;
  dist?: string;
  bucket?: string;
  expiresInSec?: number;
}
