// =============================================================================
// Booking Validation Schemas — Zod v4 compatible
// =============================================================================

import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z
    .string({ error: 'Service ID is required' })
    .uuid('Invalid service ID'),

  providerId: z
    .string({ error: 'Provider ID is required' })
    .uuid('Invalid provider ID'),

  scheduledDate: z
    .string({ error: 'Scheduled date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  scheduledTime: z
    .string({ error: 'Scheduled time is required' })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in HH:MM format'),

  address: z
    .string({ error: 'Address is required' })
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address must be less than 500 characters'),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .nullable()
    .optional(),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .nullable()
    .optional(),
});

export const cancelBookingSchema = z.object({
  reason: z
    .string({ error: 'Cancellation reason is required' })
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason must be less than 500 characters'),
});

export const rejectBookingSchema = z.object({
  reason: z
    .string()
    .max(500, 'Reason must be less than 500 characters')
    .nullable()
    .optional(),
});

export const completeBookingSchema = z.object({
  finalPrice: z
    .number()
    .min(0, 'Final price cannot be negative')
    .max(9999999.99, 'Final price is too high')
    .nullable()
    .optional(),
});

export const listBookingsQuerySchema = z.object({
  status: z.string().optional(),
  role: z.enum(['customer', 'provider']).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
