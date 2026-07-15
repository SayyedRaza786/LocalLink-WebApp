// =============================================================================
// Async Handler — Eliminates try/catch boilerplate in route handlers.
// Wraps an async Express handler and forwards any thrown error
// to the next() error handler automatically.
// =============================================================================

import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncRouteHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
