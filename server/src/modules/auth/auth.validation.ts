// =============================================================================
// Auth Validation Schemas
// Zod schemas for all auth endpoint request bodies.
// Strict validation with clear error messages.
// Compatible with Zod v4.
// =============================================================================

import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  firstName: z
    .string({ error: 'First name is required' })
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .transform((val) => val.trim()),

  lastName: z
    .string({ error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .transform((val) => val.trim()),

  role: z.enum(['CUSTOMER', 'PROVIDER'], {
    error: 'Role must be either CUSTOMER or PROVIDER',
  }).default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
});

export const resetPasswordSchema = z.object({
  token: z.string({ error: 'Reset token is required' }).min(1),

  newPassword: z
    .string({ error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
