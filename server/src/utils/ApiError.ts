// =============================================================================
// ApiError — Custom error class with HTTP status codes
// Extends Error to carry status codes and structured error data.
// The global error handler catches these and formats the response.
// =============================================================================

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    errors: Array<{ field?: string; message: string }> = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Capture stack trace, excluding constructor from it
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // Factory methods for common errors
  static badRequest(message: string, errors?: Array<{ field?: string; message: string }>) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static validationError(errors: Array<{ field?: string; message: string }>) {
    return new ApiError(422, 'Validation failed', errors);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}
