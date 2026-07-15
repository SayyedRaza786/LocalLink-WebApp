// =============================================================================
// User Controller — HTTP Layer
// Handles request parsing, calls the service, and formats responses.
// =============================================================================

import { Request, Response } from 'express';
import { userService } from './user.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class UserController {
  /**
   * GET /api/v1/users/me
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getMe(req.user!.userId);
    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  /**
   * PATCH /api/v1/users/me
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  /**
   * PATCH /api/v1/users/me/password
   */
  changePassword = asyncHandler(async (req: Request, res: Response) => {
    await userService.changePassword(req.user!.userId, req.body);
    return ApiResponse.success(res, null, 'Password changed successfully');
  });
}

export const userController = new UserController();
