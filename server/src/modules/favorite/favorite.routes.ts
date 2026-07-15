// =============================================================================
// Favorite Routes
// All routes require authentication with CUSTOMER role.
// =============================================================================

import { Router } from 'express';
import { favoriteController } from './favorite.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// All favorite routes require customer auth
router.use(authenticate, authorize(Role.CUSTOMER));

// GET /api/v1/favorites
router.get('/', favoriteController.list);

// POST /api/v1/favorites/:providerId
router.post('/:providerId', favoriteController.add);

// DELETE /api/v1/favorites/:providerId
router.delete('/:providerId', favoriteController.remove);

export default router;
