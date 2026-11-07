import type { RequestHandler } from "express";
import multer from "multer";
import { dirname, normalize, relative, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { BadRequestException } from "../exceptions";
import { FILE_MIME_TYPES } from "../constants";
import { fileFilter } from "../utils";
import { FILE_TYPE, MULTER_STORAGE } from "../enums";

const FOLDER_NAME = "uploads";

const dist = resolve(FOLDER_NAME);

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

function getFilePath({
  fieldname,
  originalname,
  userId,
  currCount,
  ext,
  renameFiles,
}: {
  fieldname: string;
  originalname: string;
  userId: string;
  currCount: number;
  ext: string;
  renameFiles: boolean;
}): { filePath: string; fileFullPath: string } {
  const fileName = renameFiles
    ? `${fieldname}-${currCount}.${ext}`
    : originalname;

  const fileFullPath = normalize(`${dist}/${userId}/${fieldname}/${fileName}`);

  const currDir = resolve();
  const filePath = relative(currDir, fileFullPath);

  return { filePath, fileFullPath };
}

async function processFiles({
  files,
  allowedTypes,
  userId = randomUUID(),
  renameFiles,
}: {
  files: Express.Multer.File[];
  allowedTypes: string[];
  userId: string | undefined;
  renameFiles: boolean;
}): Promise<{ paths: Record<string, string[]>; dist: string }> {
  const paths: Record<string, string[]> = {};

  for (const file of files) {
    const { buffer, path, originalname, fieldname } = file;

    let fileBuffer: Buffer<ArrayBufferLike>;
    if (path) {
      fileBuffer = await readFile(path);
    } else {
      fileBuffer = buffer;
    }

    const result = await fileFilter(fileBuffer, allowedTypes);

    if (!result.isValid) {
      throw new BadRequestException(
        `Invalid file type ${originalname}${allowedTypes.length > 0 ? ` Supported Types: ${allowedTypes.join(", ")}` : ""}`,
      );
    }

    const fieldPaths = paths[fieldname] ?? [];
    const currCount = fieldPaths.length + 1;

    const { filePath, fileFullPath } = getFilePath({
      fieldname,
      originalname,
      userId,
      currCount,
      ext: result.ext,
      renameFiles,
    });

    await mkdir(dirname(fileFullPath), { recursive: true });
    await writeFile(fileFullPath, fileBuffer);
    await rm(path);

    if (!paths[fieldname]) {
      paths[fieldname] = [];
    }

    paths[fieldname].push(filePath);
  }

  return { paths, dist: userId };
}

export function upload(
  multerMiddleWare = getMulterInstance().array("attachments"),
  fileType = FILE_TYPE.FILE,
  renameFiles = true,
): RequestHandler {
  return function (req, res, next) {
    multerMiddleWare(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file && !req.files) {
        return next();
      }

      const files = [];
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
        const { paths, dist } = await processFiles({
          files,
          allowedTypes: FILE_MIME_TYPES[fileType] ?? [],
          userId: req.user?.id,
          renameFiles,
        });

        req.paths = paths;
        req.dist = `${FOLDER_NAME}/${dist}`;

        return next();
      } catch (err) {
        return next(err);
      }
    });
  };
}
