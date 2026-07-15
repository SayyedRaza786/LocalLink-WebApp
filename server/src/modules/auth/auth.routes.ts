// =============================================================================
// Auth Routes
// Maps HTTP endpoints to auth controller methods.
// All routes prefixed with /api/v1/auth (applied in app.ts).
// =============================================================================

import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from './auth.validation';
import { authLimiter } from '../../middleware/rateLimiter';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Rate limit all auth endpoints
router.use(authLimiter);

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

export default router;
