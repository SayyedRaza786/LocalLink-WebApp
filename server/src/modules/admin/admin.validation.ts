// =============================================================================
// Admin Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ error: 'isActive is required' }),
});

export const verifyProviderSchema = z.object({
  isVerified: z.boolean({ error: 'isVerified is required' }),
});

export const resolveReportSchema = z.object({
  status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED'], {
    error: 'Status must be REVIEWED, RESOLVED, or DISMISSED',
  }),
  adminNotes: z
    .string()
    .max(2000, 'Admin notes must be less than 2000 characters')
    .nullable()
    .optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const listProvidersQuerySchema = z.object({
  isVerified: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const listReportsQuerySchema = z.object({
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type VerifyProviderInput = z.infer<typeof verifyProviderSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
