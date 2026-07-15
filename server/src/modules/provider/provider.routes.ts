// =============================================================================
// Provider Routes
// Public routes for searching/viewing providers.
// Authenticated provider routes for profile/gallery/availability management.
// =============================================================================

import { Router } from 'express';
import { providerController } from './provider.controller';
import { validate } from '../../middleware/validate';
import {
  upsertProviderProfileSchema,
  setAvailabilitySchema,
  addGalleryImageSchema,
  searchProvidersSchema,
} from './provider.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// --- Provider Self-Management Routes (must be before /:id) ---

// GET /api/v1/providers/me/profile
router.get(
  '/me/profile',
  authenticate,
  authorize(Role.PROVIDER),
  providerController.getOwnProfile
);

// PUT /api/v1/providers/me/profile
router.put(
  '/me/profile',
  authenticate,
  authorize(Role.PROVIDER),
  validate(upsertProviderProfileSchema),
  providerController.upsertProfile
);

// GET /api/v1/providers/me/availability
router.get(
  '/me/availability',
  authenticate,
  authorize(Role.PROVIDER),
  providerController.getAvailability
);

// PUT /api/v1/providers/me/availability
router.put(
  '/me/availability',
  authenticate,
  authorize(Role.PROVIDER),
  validate(setAvailabilitySchema),
  providerController.setAvailability
);

// GET /api/v1/providers/me/gallery
router.get(
  '/me/gallery',
  authenticate,
  authorize(Role.PROVIDER),
  providerController.getGallery
);

// POST /api/v1/providers/me/gallery
router.post(
  '/me/gallery',
  authenticate,
  authorize(Role.PROVIDER),
  validate(addGalleryImageSchema),
  providerController.addGalleryImage
);

// DELETE /api/v1/providers/me/gallery/:imageId
router.delete(
  '/me/gallery/:imageId',
  authenticate,
  authorize(Role.PROVIDER),
  providerController.deleteGalleryImage
);

// --- Public Routes ---

// GET /api/v1/providers — Search providers
router.get('/', validate(searchProvidersSchema, 'query'), providerController.search);

// GET /api/v1/providers/:id — Get public profile
router.get('/:id', providerController.getPublicProfile);

// GET /api/v1/providers/:id/reviews — Get provider reviews
router.get('/:id/reviews', providerController.getReviews);

export default router;
