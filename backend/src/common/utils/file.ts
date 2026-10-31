import { fileTypeFromBuffer, FileTypeResult } from "file-type";

export async function getFileType(
  buffer: ArrayBuffer | Buffer<ArrayBufferLike>,
): Promise<FileTypeResult | undefined> {
  return fileTypeFromBuffer(buffer);
}

export async function fileFilter(
  fileBuffer: ArrayBuffer | Buffer<ArrayBufferLike>,
  allowedTypes: string[],
): Promise<
  { isValid: false } | { isValid: boolean; type: string; ext: string }
> {
  const res = await getFileType(fileBuffer);

  if (!res) {
    return { isValid: false };
  }

  const { ext, mime } = res;

  return { type: mime, ext, isValid: allowedTypes.includes(mime) };
}
