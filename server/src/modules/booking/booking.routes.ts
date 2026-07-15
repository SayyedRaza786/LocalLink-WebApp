// =============================================================================
// Booking Routes
// All routes require authentication.
// Customer creates bookings; provider manages transitions.
// =============================================================================

import { Router } from 'express';
import { bookingController } from './booking.controller';
import { validate } from '../../middleware/validate';
import {
  createBookingSchema,
  cancelBookingSchema,
  rejectBookingSchema,
  completeBookingSchema,
  listBookingsQuerySchema,
} from './booking.validation';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// POST /api/v1/bookings — Customer creates a booking
router.post(
  '/',
  authorize(Role.CUSTOMER),
  validate(createBookingSchema),
  bookingController.create
);

// GET /api/v1/bookings — List own bookings
router.get('/', validate(listBookingsQuerySchema, 'query'), bookingController.list);

// GET /api/v1/bookings/:id — Get booking detail
router.get('/:id', bookingController.getById);

// PATCH /api/v1/bookings/:id/accept — Provider accepts
router.patch(
  '/:id/accept',
  authorize(Role.PROVIDER),
  bookingController.accept
);

// PATCH /api/v1/bookings/:id/reject — Provider rejects
router.patch(
  '/:id/reject',
  authorize(Role.PROVIDER),
  validate(rejectBookingSchema),
  bookingController.reject
);

// PATCH /api/v1/bookings/:id/on-the-way — Provider on the way
router.patch(
  '/:id/on-the-way',
  authorize(Role.PROVIDER),
  bookingController.onTheWay
);

// PATCH /api/v1/bookings/:id/start — Provider starts service
router.patch(
  '/:id/start',
  authorize(Role.PROVIDER),
  bookingController.start
);

// PATCH /api/v1/bookings/:id/complete — Provider completes service
router.patch(
  '/:id/complete',
  authorize(Role.PROVIDER),
  validate(completeBookingSchema),
  bookingController.complete
);

// PATCH /api/v1/bookings/:id/cancel — Either party cancels
router.patch(
  '/:id/cancel',
  validate(cancelBookingSchema),
  bookingController.cancel
);

export default router;
