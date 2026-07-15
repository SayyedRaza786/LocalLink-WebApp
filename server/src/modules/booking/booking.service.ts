// =============================================================================
// Booking Service — Business Logic Layer
// Implements the booking state machine with transition validations.
// Handles creation, status transitions, and listing.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { BookingStatus, CancelledBy, Prisma } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';
import { generateBookingNumber } from '../../utils/bookingNumber';
import {
  CreateBookingInput,
  CancelBookingInput,
  RejectBookingInput,
  CompleteBookingInput,
  ListBookingsQuery,
} from './booking.validation';

// Valid state transitions
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.ACCEPTED, BookingStatus.REJECTED, BookingStatus.CANCELLED, BookingStatus.EXPIRED],
  ACCEPTED: [BookingStatus.ON_THE_WAY, BookingStatus.CANCELLED],
  ON_THE_WAY: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  EXPIRED: [],
};

export class BookingService {
  /**
   * Create a new booking request.
   */
  async create(customerId: string, input: CreateBookingInput) {
    // Verify the service exists, is active, and belongs to the provider
    const service = await prisma.service.findFirst({
      where: {
        id: input.serviceId,
        providerId: input.providerId,
        isActive: true,
      },
      include: {
        provider: {
          select: { id: true, isAvailable: true, userId: true },
        },
      },
    });

    if (!service) {
      throw ApiError.badRequest('Service not found or not available');
    }

    if (!service.provider.isAvailable) {
      throw ApiError.badRequest('This provider is currently not available');
    }

    // Cannot book your own service
    if (service.provider.userId === customerId) {
      throw ApiError.badRequest('You cannot book your own service');
    }

    // Validate date is in the future
    const scheduledDate = new Date(`${input.scheduledDate}T${input.scheduledTime}:00`);
    if (scheduledDate <= new Date()) {
      throw ApiError.badRequest('Scheduled date and time must be in the future');
    }

    // Generate unique booking number
    let bookingNumber = generateBookingNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.booking.findUnique({
        where: { bookingNumber },
      });
      if (!existing) break;
      bookingNumber = generateBookingNumber();
      attempts++;
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        customerId,
        providerId: input.providerId,
        serviceId: input.serviceId,
        scheduledDate: new Date(input.scheduledDate),
        scheduledTime: new Date(`1970-01-01T${input.scheduledTime}:00Z`),
        address: input.address,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        notes: input.notes ?? null,
        quotedPrice: service.price,
        status: BookingStatus.PENDING,
      },
      include: {
        service: { select: { name: true, price: true, priceType: true } },
        provider: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        customer: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    // Increment provider's total bookings
    await prisma.providerProfile.update({
      where: { id: input.providerId },
      data: { totalBookings: { increment: 1 } },
    });

    return booking;
  }

  /**
   * List bookings for the authenticated user.
   */
  async list(userId: string, params: ListBookingsQuery) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.BookingWhereInput = {};

    // Determine if user is viewing as customer or provider
    if (params.role === 'provider') {
      const profile = await prisma.providerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) {
        throw ApiError.notFound('Provider profile not found');
      }
      where.providerId = profile.id;
    } else {
      where.customerId = userId;
    }

    // Status filter
    if (params.status) {
      const statuses = params.status.split(',') as BookingStatus[];
      where.status = { in: statuses };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true, price: true, priceType: true } },
          customer: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          provider: {
            select: {
              id: true,
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total, page, limit };
  }

  /**
   * Get a booking by ID (only for participants).
   */
  async getById(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: { name: true, price: true, priceType: true, durationMinutes: true },
        },
        customer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true },
        },
        provider: {
          select: {
            id: true,
            city: true,
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true },
            },
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Check ownership
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider.user.id === userId;

    if (!isCustomer && !isProvider) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Transition a booking to a new status.
   * Validates the transition according to the state machine.
   */
  private async transition(
    bookingId: string,
    userId: string,
    newStatus: BookingStatus,
    options?: {
      requireProvider?: boolean;
      requireCustomer?: boolean;
      cancellationReason?: string;
      cancelledBy?: CancelledBy;
      finalPrice?: number | null;
    }
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: { select: { id: true, userId: true } },
      },
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Validate ownership
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider.userId === userId;

    if (options?.requireProvider && !isProvider) {
      throw ApiError.forbidden('Only the provider can perform this action');
    }
    if (options?.requireCustomer && !isCustomer) {
      throw ApiError.forbidden('Only the customer can perform this action');
    }
    if (!isCustomer && !isProvider) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    // Validate state transition
    const allowedTransitions = VALID_TRANSITIONS[booking.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition from ${booking.status} to ${newStatus}`
      );
    }

    // Update booking
    const updateData: Prisma.BookingUpdateInput = { status: newStatus };

    if (options?.cancellationReason) {
      updateData.cancellationReason = options.cancellationReason;
    }
    if (options?.cancelledBy) {
      updateData.cancelledBy = options.cancelledBy;
    }
    if (newStatus === BookingStatus.COMPLETED) {
      updateData.completedAt = new Date();
      if (options?.finalPrice !== undefined) {
        updateData.finalPrice = options.finalPrice;
      }
    }

    return prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: { select: { name: true, price: true, priceType: true } },
        customer: {
          select: { id: true, firstName: true, lastName: true },
        },
        provider: {
          select: {
            id: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  /**
   * Provider accepts a booking.
   */
  async accept(userId: string, bookingId: string) {
    return this.transition(bookingId, userId, BookingStatus.ACCEPTED, {
      requireProvider: true,
    });
  }

  /**
   * Provider rejects a booking.
   */
  async reject(userId: string, bookingId: string, input?: RejectBookingInput) {
    return this.transition(bookingId, userId, BookingStatus.REJECTED, {
      requireProvider: true,
      cancellationReason: input?.reason ?? undefined,
    });
  }

  /**
   * Provider marks as on the way.
   */
  async onTheWay(userId: string, bookingId: string) {
    return this.transition(bookingId, userId, BookingStatus.ON_THE_WAY, {
      requireProvider: true,
    });
  }

  /**
   * Provider starts the service.
   */
  async start(userId: string, bookingId: string) {
    return this.transition(bookingId, userId, BookingStatus.IN_PROGRESS, {
      requireProvider: true,
    });
  }

  /**
   * Provider completes the service.
   */
  async complete(userId: string, bookingId: string, input?: CompleteBookingInput) {
    return this.transition(bookingId, userId, BookingStatus.COMPLETED, {
      requireProvider: true,
      finalPrice: input?.finalPrice,
    });
  }

  /**
   * Either party cancels the booking.
   */
  async cancel(userId: string, bookingId: string, input: CancelBookingInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: { select: { userId: true } } },
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider.userId === userId;

    const cancelledBy = isCustomer
      ? CancelledBy.CUSTOMER
      : isProvider
        ? CancelledBy.PROVIDER
        : null;

    if (!cancelledBy) {
      throw ApiError.forbidden('You do not have access to this booking');
    }

    return this.transition(bookingId, userId, BookingStatus.CANCELLED, {
      cancellationReason: input.reason,
      cancelledBy,
    });
  }
}

export const bookingService = new BookingService();
