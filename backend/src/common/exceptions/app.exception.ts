export class AppException extends Error {
  constructor(
    message: string,
    public status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    Error.captureStackTrace(this);
  }
}
