// =============================================================================
// Review Routes
// All routes require authentication with CUSTOMER role.
// =============================================================================

import { Router } from 'express';
import { reviewController } from './review.controller';
import { validate } from '../../middleware/validate';
import { createReviewSchema, updateReviewSchema } from './review.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// All review routes require authentication
router.use(authenticate);

// POST /api/v1/reviews — Customer only
router.post(
  '/',
  authorize(Role.CUSTOMER),
  validate(createReviewSchema),
  reviewController.create
);

// PATCH /api/v1/reviews/:id — Customer only
router.patch(
  '/:id',
  authorize(Role.CUSTOMER),
  validate(updateReviewSchema),
  reviewController.update
);

// DELETE /api/v1/reviews/:id — Customer only
router.delete(
  '/:id',
  authorize(Role.CUSTOMER),
  reviewController.delete
);

export default router;
