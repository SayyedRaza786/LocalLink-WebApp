// =============================================================================
// Auth Controller — HTTP Layer
// Handles request parsing, calls the service, and formats responses.
// No business logic here — that belongs in auth.service.ts.
// =============================================================================

import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';

// Cookie options for the refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                              // Not accessible via JavaScript
  secure: env.NODE_ENV === 'production',       // HTTPS only in production
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax', // Support cross-origin cookies in production
  maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days in milliseconds
  path: '/api/v1/auth',                        // Only sent to auth endpoints
};

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.created(res, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Registration successful');
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.success(res, {
      user: result.user,
      accessToken: result.accessToken,
    }, 'Login successful');
  });

  /**
   * POST /api/v1/auth/refresh
   * Reads refresh token from HttpOnly cookie (not request body).
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      return ApiResponse.success(res, null, 'No refresh token provided', 401);
    }

    const result = await authService.refreshAccessToken(rawRefreshToken);

    // Set new refresh token cookie (rotation)
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.success(res, {
      accessToken: result.accessToken,
    }, 'Token refreshed successfully');
  });

  /**
   * POST /api/v1/auth/logout
   * Revokes the refresh token and clears the cookie.
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (rawRefreshToken) {
      await authService.logout(rawRefreshToken);
    }

    // Clear the cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
      path: '/api/v1/auth',
    });

    return ApiResponse.success(res, null, 'Logged out successfully');
  });
}

export const authController = new AuthController();
