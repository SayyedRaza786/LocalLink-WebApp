// =============================================================================
// Authorization Middleware
// Role-based access control. Checks if the authenticated user's role
// is in the allowed roles list. Must be used AFTER authenticate middleware.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

/**
 * Creates a middleware that restricts access to specified roles.
 * Usage: authorize(Role.ADMIN) or authorize(Role.PROVIDER, Role.ADMIN)
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};
