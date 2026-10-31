import { AppException } from "./app.exception";

export class NotFoundException extends AppException {
  constructor(message = "Resource not found", options?: ErrorOptions) {
    super(message, 404, options);
  }
}

export class BadRequestException extends AppException {
  constructor(message = "Bad request", options?: ErrorOptions) {
    super(message, 400, options);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = "Unauthorized", options?: ErrorOptions) {
    super(message, 401, options);
  }
}

export class ForbiddenException extends AppException {
  constructor(message = "Forbidden", options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class ConflictException extends AppException {
  constructor(message = "Conflict", options?: ErrorOptions) {
    super(message, 409, options);
  }
}

export class InternalServerException extends AppException {
  constructor(message = "Internal Server Error", options?: ErrorOptions) {
    super(message, 500, options);
  }
}

export { AppException } from "./app.exception";
