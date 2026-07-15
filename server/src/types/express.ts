// =============================================================================
// Express Request Type Augmentation
// Loads at runtime as a no-op module so ts-node includes the Request extension.
// =============================================================================

import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
