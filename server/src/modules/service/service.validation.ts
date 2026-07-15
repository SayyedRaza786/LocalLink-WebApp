// =============================================================================
// Service Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

export const createServiceSchema = z.object({
  categoryId: z
    .string({ error: 'Category is required' })
    .uuid('Invalid category ID'),

  name: z
    .string({ error: 'Service name is required' })
    .min(1, 'Service name is required')
    .max(200, 'Service name must be less than 200 characters')
    .transform((val) => val.trim()),

  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .optional(),

  price: z
    .number({ error: 'Price is required' })
    .min(0, 'Price cannot be negative')
    .max(9999999.99, 'Price is too high'),

  priceType: z
    .enum(['FIXED', 'HOURLY', 'STARTING_AT'], {
      error: 'Price type must be FIXED, HOURLY, or STARTING_AT',
    })
    .default('FIXED'),

  durationMinutes: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours')
    .nullable()
    .optional(),
});

export const updateServiceSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),

  name: z
    .string()
    .min(1, 'Service name is required')
    .max(200, 'Service name must be less than 200 characters')
    .transform((val) => val.trim())
    .optional(),

  description: z
    .string()
    .max(2000, 'Description must be less than 2000 characters')
    .nullable()
    .optional(),

  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(9999999.99, 'Price is too high')
    .optional(),

  priceType: z
    .enum(['FIXED', 'HOURLY', 'STARTING_AT'])
    .optional(),

  durationMinutes: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration cannot exceed 24 hours')
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export const addServiceImageSchema = z.object({
  imageUrl: z
    .string({ error: 'Image URL is required' })
    .url('Invalid URL format')
    .max(500, 'URL must be less than 500 characters'),
  sortOrder: z.number().int().min(0).default(0).optional(),
});

export const listServicesQuerySchema = z.object({
  category: z.string().optional(),
  provider: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type AddServiceImageInput = z.infer<typeof addServiceImageSchema>;
export type ListServicesQuery = z.infer<typeof listServicesQuerySchema>;
