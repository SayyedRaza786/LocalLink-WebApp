// =============================================================================
// Express Request Type Augmentation
// Extends the Express Request interface to include the authenticated user
// payload attached by the authenticate middleware.
// =============================================================================

import type { Role } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: Role;
    };
  }
}

export {};
