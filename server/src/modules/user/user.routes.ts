// =============================================================================
// User Routes
// Maps HTTP endpoints to user controller methods.
// All routes prefixed with /api/v1/users (applied in app.ts).
// All routes require authentication.
// =============================================================================

import { Router } from 'express';
import { userController } from './user.controller';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from './user.validation';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/v1/users/me
router.get('/me', userController.getMe);

// PATCH /api/v1/users/me
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);

// PATCH /api/v1/users/me/password
router.patch('/me/password', validate(changePasswordSchema), userController.changePassword);

export default router;
