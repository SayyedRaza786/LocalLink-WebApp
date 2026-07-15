// =============================================================================
// Admin Routes
// All routes require authentication with ADMIN role.
// =============================================================================

import { Router } from 'express';
import { adminController } from './admin.controller';
import { validate } from '../../middleware/validate';
import {
  updateUserStatusSchema,
  verifyProviderSchema,
  resolveReportSchema,
  listUsersQuerySchema,
  listProvidersQuerySchema,
  listReportsQuerySchema,
} from './admin.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize(Role.ADMIN));

// GET /api/v1/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// GET /api/v1/admin/users
router.get('/users', validate(listUsersQuerySchema, 'query'), adminController.listUsers);

// PATCH /api/v1/admin/users/:id/status
router.patch(
  '/users/:id/status',
  validate(updateUserStatusSchema),
  adminController.updateUserStatus
);

// GET /api/v1/admin/providers
router.get(
  '/providers',
  validate(listProvidersQuerySchema, 'query'),
  adminController.listProviders
);

// PATCH /api/v1/admin/providers/:id/verify
router.patch(
  '/providers/:id/verify',
  validate(verifyProviderSchema),
  adminController.verifyProvider
);

// GET /api/v1/admin/reports
router.get('/reports', validate(listReportsQuerySchema, 'query'), adminController.listReports);

// PATCH /api/v1/admin/reports/:id
router.patch(
  '/reports/:id',
  validate(resolveReportSchema),
  adminController.resolveReport
);

export default router;
