// =============================================================================
// Notification Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const isRead = req.query.isRead as string | undefined;

    const result = await notificationService.list(req.user!.userId, {
      isRead,
      page,
      limit,
    });

    // Include unreadCount in response meta
    return ApiResponse.success(
      res,
      result.notifications,
      'Notifications retrieved successfully',
      200,
      {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      }
    );
  });

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(
      req.user!.userId,
      req.params.id as string
    );
    return ApiResponse.success(res, notification, 'Notification marked as read');
  });

  /**
   * PATCH /api/v1/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.userId);
    return ApiResponse.success(res, null, 'All notifications marked as read');
  });
}

export const notificationController = new NotificationController();
