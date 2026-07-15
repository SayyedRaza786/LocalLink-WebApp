// =============================================================================
// User Validation Schemas
// Zod schemas for user profile endpoints. Compatible with Zod v4.
// =============================================================================

import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .transform((val) => val.trim())
    .optional(),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .transform((val) => val.trim())
    .optional(),

  phone: z
    .string()
    .max(20, 'Phone must be less than 20 characters')
    .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format')
    .nullable()
    .optional(),

  avatarUrl: z
    .string()
    .url('Invalid URL format')
    .max(500, 'Avatar URL must be less than 500 characters')
    .nullable()
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password is required'),

  newPassword: z
    .string({ error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
