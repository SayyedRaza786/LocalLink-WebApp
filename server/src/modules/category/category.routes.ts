// =============================================================================
// Category Routes
// Public routes for listing categories.
// Admin routes for CRUD operations.
// =============================================================================

import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from './category.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// --- Public Routes ---

// GET /api/v1/categories
router.get('/', categoryController.listActive);

// GET /api/v1/categories/:slug
router.get('/:slug', categoryController.getBySlug);

// --- Admin Routes ---

// GET /api/v1/categories/admin/all
router.get('/admin/all', authenticate, authorize(Role.ADMIN), categoryController.listAll);

// POST /api/v1/categories
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validate(createCategorySchema),
  categoryController.create
);

// PATCH /api/v1/categories/:id
router.patch(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateCategorySchema),
  categoryController.update
);

// DELETE /api/v1/categories/:id
router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN),
  categoryController.delete
);

export default router;
