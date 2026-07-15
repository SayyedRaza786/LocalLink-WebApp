// =============================================================================
// Service Routes
// Public routes for listing/viewing services.
// Provider routes for managing their own services.
// =============================================================================

import { Router } from 'express';
import { serviceController } from './service.controller';
import { validate } from '../../middleware/validate';
import {
  createServiceSchema,
  updateServiceSchema,
  addServiceImageSchema,
  listServicesQuerySchema,
} from './service.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// --- Public Routes ---

// GET /api/v1/services
router.get('/', validate(listServicesQuerySchema, 'query'), serviceController.list);

// GET /api/v1/services/:id
router.get('/:id', serviceController.getById);

// --- Provider Routes ---

// POST /api/v1/services
router.post(
  '/',
  authenticate,
  authorize(Role.PROVIDER),
  validate(createServiceSchema),
  serviceController.create
);

// PATCH /api/v1/services/:id
router.patch(
  '/:id',
  authenticate,
  authorize(Role.PROVIDER),
  validate(updateServiceSchema),
  serviceController.update
);

// DELETE /api/v1/services/:id
router.delete(
  '/:id',
  authenticate,
  authorize(Role.PROVIDER),
  serviceController.delete
);

// POST /api/v1/services/:id/images
router.post(
  '/:id/images',
  authenticate,
  authorize(Role.PROVIDER),
  validate(addServiceImageSchema),
  serviceController.addImage
);

// DELETE /api/v1/services/:id/images/:imageId
router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize(Role.PROVIDER),
  serviceController.deleteImage
);

export default router;
