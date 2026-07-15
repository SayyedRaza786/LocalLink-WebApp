// =============================================================================
// Validation Middleware
// Generic Zod validation middleware that validates request body, query,
// or params against a Zod schema. Returns 422 with structured errors.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a middleware that validates the specified request property
 * against a Zod schema. On failure, throws a 422 with field-level errors.
 *
 * Usage: validate(registerSchema, 'body')
 */
export const validate = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace the raw request data with the parsed (and transformed) data
      Object.defineProperty(req, target, {
        value: parsed,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        next(ApiError.validationError(formattedErrors));
      } else {
        next(error);
      }
    }
  };
};
