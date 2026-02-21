export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  constructor(statusCode = 500, message = "", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}