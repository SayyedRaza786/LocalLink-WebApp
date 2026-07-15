// =============================================================================
// Review Service — Business Logic Layer
// Handles review creation with booking ownership validation,
// and updates provider aggregate rating on changes.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { BookingStatus } from '@prisma/client';
import { CreateReviewInput, UpdateReviewInput } from './review.validation';

export class ReviewService {
  /**
   * Create a review for a completed booking.
   * Only the customer who made the booking can review.
   * One review per booking (enforced at DB level too).
   */
  async create(customerId: string, input: CreateReviewInput) {
    // Get the booking and verify ownership + status
    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        review: true,
        provider: { select: { id: true } },
      },
    });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.customerId !== customerId) {
      throw ApiError.forbidden('You can only review your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw ApiError.badRequest('You can only review completed bookings');
    }

    if (booking.review) {
      throw ApiError.conflict('You have already reviewed this booking');
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId: input.bookingId,
        customerId,
        providerId: booking.providerId,
        rating: input.rating,
        comment: input.comment ?? null,
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Update provider aggregate rating
    await this.updateProviderRating(booking.providerId);

    return review;
  }

  /**
   * Update a review (owner only).
   */
  async update(customerId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.customerId !== customerId) {
      throw ApiError.forbidden('You can only edit your own reviews');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.comment !== undefined && { comment: input.comment }),
      },
      include: {
        customer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Re-calculate provider aggregate rating if rating changed
    if (input.rating !== undefined) {
      await this.updateProviderRating(review.providerId);
    }

    return updated;
  }

  /**
   * Delete a review (owner only).
   */
  async delete(customerId: string, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.customerId !== customerId) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Update provider aggregate rating
    await this.updateProviderRating(review.providerId);
  }

  /**
   * Recalculate and update provider's aggregate rating and total review count.
   * Called after any review create/update/delete.
   */
  private async updateProviderRating(providerId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { providerId, isHidden: false },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count.rating,
      },
    });
  }
}

export const reviewService = new ReviewService();
