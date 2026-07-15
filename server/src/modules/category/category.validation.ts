// =============================================================================
// Category Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ error: 'Category name is required' })
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .transform((val) => val.trim()),

  slug: z
    .string({ error: 'Slug is required' })
    .min(1, 'Slug is required')
    .max(120, 'Slug must be less than 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .transform((val) => val.toLowerCase().trim()),

  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),

  icon: z
    .string()
    .max(100, 'Icon must be less than 100 characters')
    .nullable()
    .optional(),

  sortOrder: z.number().int().min(0).default(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .transform((val) => val.trim())
    .optional(),

  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(120, 'Slug must be less than 120 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .transform((val) => val.toLowerCase().trim())
    .optional(),

  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .nullable()
    .optional(),

  icon: z
    .string()
    .max(100, 'Icon must be less than 100 characters')
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),

  sortOrder: z.number().int().min(0).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
