// =============================================================================
// Review Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z
    .string({ error: 'Booking ID is required' })
    .uuid('Invalid booking ID'),

  rating: z
    .number({ error: 'Rating is required' })
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),

  comment: z
    .string()
    .max(2000, 'Comment must be less than 2000 characters')
    .nullable()
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),

  comment: z
    .string()
    .max(2000, 'Comment must be less than 2000 characters')
    .nullable()
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
