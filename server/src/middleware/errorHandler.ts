// =============================================================================
// Global Error Handler
// Catches all errors thrown in route handlers and middleware.
// Formats them into the standardized API error response envelope.
// Distinguishes operational errors (expected) from programming errors.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Array<{ field?: string; message: string }> = [];
  let isOperational = false;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    isOperational = err.isOperational;
  }

  // Log the error
  if (!isOperational) {
    // Programming/unexpected errors — log full stack trace
    logger.error({ err, statusCode }, `Unhandled error: ${err.message}`);
  } else {
    // Operational errors — log at warn level (expected behavior)
    logger.warn({ statusCode, message }, `Operational error: ${message}`);
  }

  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // Include stack trace in development only
  if (env.NODE_ENV === 'development' && !isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
