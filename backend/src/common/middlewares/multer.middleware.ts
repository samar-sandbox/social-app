import type { RequestHandler } from "express";
import multer from "multer";
import { tmpdir } from "node:os";
import { readFile, rm } from "node:fs/promises";
import { BadRequestException } from "../exceptions";
import { FILE_MIME_TYPES } from "../constants";
import { fileFilter } from "../utils";
import { FILE_TYPE, MULTER_STORAGE } from "../enums";
import type { TFile } from "../types";

export function getMulterInstance(
  storage: MULTER_STORAGE = MULTER_STORAGE.MEMORY,
) {
  const storageEngine =
    storage === MULTER_STORAGE.DISK
      ? multer.diskStorage({
          destination: (_req, _file, cb) => cb(null, tmpdir()),
          filename: (_req, file, cb) => cb(null, file.originalname),
        })
      : multer.memoryStorage();

  return multer({ storage: storageEngine });
}

async function processFiles({
  files,
  allowedTypes,
}: {
  files: TFile[];
  allowedTypes: string[];
}) {
  const filesWithBuffer: TFile[] = [];

  for (const file of files) {
    const { buffer, path, originalname } = file;

    let fileBuffer: Buffer<ArrayBufferLike>;
    if (path) {
      fileBuffer = await readFile(path);
      await rm(path);
    } else {
      fileBuffer = buffer;
    }

    const result = await fileFilter(fileBuffer, allowedTypes);

    if (!result.isValid) {
      throw new BadRequestException(
        `Invalid file type ${originalname}${allowedTypes.length > 0 ? ` Supported Types: ${allowedTypes.join(", ")}` : ""}`,
      );
    }

    filesWithBuffer.push({
      ...file,
      buffer: fileBuffer,
    });
  }

  return filesWithBuffer;
}

export function upload(
  multerMiddleWare = getMulterInstance().array("attachments"),
  fileType = FILE_TYPE.FILE,
): RequestHandler {
  return function (req, res, next) {
    multerMiddleWare(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file && !req.files) {
        return next();
      }

      const files: TFile[] = [];
      if (req.file) {
        files.push(req.file);
      } else if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        Object.values(req.files ?? {}).forEach((fileArray) => {
          files.push(...fileArray);
        });
      }

      if (files.length === 0) {
        return next();
      }

      try {
        const processedFiles = await processFiles({
          files,
          allowedTypes: FILE_MIME_TYPES[fileType] ?? [],
        });

        req.files = processedFiles;

        return next();
      } catch (err) {
        return next(err);
      }
    });
  };
}
