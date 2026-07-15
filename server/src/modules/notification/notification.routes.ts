// =============================================================================
// Notification Routes
// All routes require authentication.
// =============================================================================

import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/v1/notifications
router.get('/', notificationController.list);

// PATCH /api/v1/notifications/read-all (must be before /:id)
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

export default router;
