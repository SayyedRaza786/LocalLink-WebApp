// =============================================================================
// Provider Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

// --- Provider Profile ---
export const upsertProviderProfileSchema = z.object({
  bio: z
    .string()
    .max(2000, 'Bio must be less than 2000 characters')
    .nullable()
    .optional(),

  experienceYears: z
    .number()
    .int()
    .min(0, 'Experience years cannot be negative')
    .max(100, 'Experience years seems too high')
    .nullable()
    .optional(),

  city: z
    .string({ error: 'City is required' })
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .transform((val) => val.trim()),

  area: z
    .string()
    .max(200, 'Area must be less than 200 characters')
    .transform((val) => val.trim())
    .nullable()
    .optional(),

  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .nullable()
    .optional(),

  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .nullable()
    .optional(),

  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .nullable()
    .optional(),

  serviceRadiusKm: z
    .number()
    .min(1, 'Service radius must be at least 1 km')
    .max(500, 'Service radius must be less than 500 km')
    .default(10)
    .optional(),

  isAvailable: z.boolean().optional(),
});

// --- Availability ---
const availabilitySlotSchema = z.object({
  dayOfWeek: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], {
    error: 'Invalid day of week',
  }),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format'),
  isAvailable: z.boolean().default(true),
});

export const setAvailabilitySchema = z.object({
  slots: z.array(availabilitySlotSchema).min(1, 'At least one availability slot is required'),
});

// --- Gallery ---
export const addGalleryImageSchema = z.object({
  imageUrl: z
    .string({ error: 'Image URL is required' })
    .url('Invalid URL format')
    .max(500, 'URL must be less than 500 characters'),
  caption: z
    .string()
    .max(300, 'Caption must be less than 300 characters')
    .nullable()
    .optional(),
  sortOrder: z.number().int().min(0).default(0).optional(),
});

// --- Search Query Params ---
export const searchProvidersSchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(120).optional(),
  city: z.string().max(100).optional(),
  area: z.string().max(200).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(500).optional(),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'newest', 'distance']).default('rating').optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type UpsertProviderProfileInput = z.infer<typeof upsertProviderProfileSchema>;
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
export type AddGalleryImageInput = z.infer<typeof addGalleryImageSchema>;
export type SearchProvidersInput = z.infer<typeof searchProvidersSchema>;
