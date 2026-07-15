// =============================================================================
// Notification Service — Business Logic Layer
// Handles notification creation, listing, and read status management.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { NotificationType, Prisma } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
}

export class NotificationService {
  /**
   * Create a notification.
   * Called internally by other services when business events occur.
   */
  async create(input: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        referenceId: input.referenceId ?? null,
        referenceType: input.referenceType ?? null,
      },
    });
  }

  /**
   * List notifications for a user with pagination.
   * Optionally filter by read/unread status.
   */
  async list(userId: string, params: { isRead?: string; page?: number; limit?: number }) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.NotificationWhereInput = { userId };

    if (params.isRead !== undefined) {
      where.isRead = params.isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, page, limit, unreadCount };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
