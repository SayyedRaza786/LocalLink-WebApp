// =============================================================================
// Authentication Middleware
// Extracts and verifies the JWT access token from the Authorization header.
// Attaches the decoded user payload (userId, role) to req.user.
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is missing');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized('Invalid or expired access token'));
    }
  }
};
