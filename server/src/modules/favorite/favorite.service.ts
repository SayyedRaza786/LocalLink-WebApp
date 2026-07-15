// =============================================================================
// Favorite Service — Business Logic Layer
// Toggle and list customer's saved providers.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { parsePagination } from '../../utils/pagination';

export class FavoriteService {
  /**
   * List customer's favorites with pagination.
   */
  async list(customerId: string, page?: number, limit?: number) {
    const { skip, take, page: pg, limit: lm } = parsePagination({ page, limit });

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { customerId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: {
            select: {
              id: true,
              city: true,
              avgRating: true,
              totalReviews: true,
              isVerified: true,
              isAvailable: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
              services: {
                where: { isActive: true },
                select: {
                  name: true,
                  price: true,
                  priceType: true,
                  category: { select: { name: true } },
                },
                take: 2,
              },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { customerId } }),
    ]);

    return { favorites, total, page: pg, limit: lm };
  }

  /**
   * Add a provider to favorites.
   */
  async add(customerId: string, providerId: string) {
    // Check provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { id: true, userId: true },
    });

    if (!provider) {
      throw ApiError.notFound('Provider not found');
    }

    // Cannot favorite yourself
    if (provider.userId === customerId) {
      throw ApiError.badRequest('You cannot add yourself to favorites');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        customerId_providerId: { customerId, providerId },
      },
    });

    if (existing) {
      throw ApiError.conflict('Provider is already in your favorites');
    }

    return prisma.favorite.create({
      data: { customerId, providerId },
      include: {
        provider: {
          select: {
            id: true,
            city: true,
            avgRating: true,
            isVerified: true,
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });
  }

  /**
   * Remove a provider from favorites.
   */
  async remove(customerId: string, providerId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        customerId_providerId: { customerId, providerId },
      },
    });

    if (!favorite) {
      throw ApiError.notFound('Provider is not in your favorites');
    }

    await prisma.favorite.delete({
      where: {
        customerId_providerId: { customerId, providerId },
      },
    });
  }
}

export const favoriteService = new FavoriteService();
