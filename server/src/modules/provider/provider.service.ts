// =============================================================================
// Provider Service — Business Logic Layer
// Handles provider profile CRUD, gallery management, availability,
// and provider search/discovery with filtering and sorting.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { Prisma, DayOfWeek } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';
import { haversineDistance, getBoundingBox } from '../../utils/geo';
import {
  UpsertProviderProfileInput,
  SetAvailabilityInput,
  AddGalleryImageInput,
  SearchProvidersInput,
} from './provider.validation';

export class ProviderService {
  /**
   * Get a provider's public profile by provider profile ID.
   */
  async getPublicProfile(id: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          },
        },
        services: {
          where: { isActive: true },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        gallery: { orderBy: { sortOrder: 'asc' } },
        availability: {
          where: { isAvailable: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    });

    if (!provider) {
      throw ApiError.notFound('Provider not found');
    }

    return provider;
  }

  /**
   * Get own provider profile (for the logged-in provider).
   */
  async getOwnProfile(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        services: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            images: { orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        gallery: { orderBy: { sortOrder: 'asc' } },
        availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found. Please create your profile first.');
    }

    return profile;
  }

  /**
   * Create or update provider profile.
   * Uses upsert: if the provider already has a profile, update it; otherwise create.
   */
  async upsertProfile(userId: string, input: UpsertProviderProfileInput) {
    const profile = await prisma.providerProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: input.bio ?? null,
        experienceYears: input.experienceYears ?? null,
        city: input.city,
        area: input.area ?? null,
        address: input.address ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        serviceRadiusKm: input.serviceRadiusKm ?? 10,
        isAvailable: input.isAvailable ?? true,
      },
      update: {
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.experienceYears !== undefined && { experienceYears: input.experienceYears }),
        ...(input.city !== undefined && { city: input.city }),
        ...(input.area !== undefined && { area: input.area }),
        ...(input.address !== undefined && { address: input.address }),
        ...(input.latitude !== undefined && { latitude: input.latitude }),
        ...(input.longitude !== undefined && { longitude: input.longitude }),
        ...(input.serviceRadiusKm !== undefined && { serviceRadiusKm: input.serviceRadiusKm }),
        ...(input.isAvailable !== undefined && { isAvailable: input.isAvailable }),
      },
    });

    return profile;
  }

  /**
   * Set weekly availability (replaces all existing slots).
   */
  async setAvailability(userId: string, input: SetAvailabilityInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found. Create your profile first.');
    }

    // Delete all existing slots and create new ones in a transaction
    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { providerId: profile.id } }),
      prisma.availability.createMany({
        data: input.slots.map((slot) => ({
          providerId: profile.id,
          dayOfWeek: slot.dayOfWeek as DayOfWeek,
          startTime: new Date(`1970-01-01T${slot.startTime}:00Z`),
          endTime: new Date(`1970-01-01T${slot.endTime}:00Z`),
          isAvailable: slot.isAvailable,
        })),
      }),
    ]);

    // Return updated slots
    return prisma.availability.findMany({
      where: { providerId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Get provider's availability.
   */
  async getAvailability(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    return prisma.availability.findMany({
      where: { providerId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Add a gallery image.
   */
  async addGalleryImage(userId: string, input: AddGalleryImageInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    return prisma.providerGallery.create({
      data: {
        providerId: profile.id,
        imageUrl: input.imageUrl,
        caption: input.caption ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  /**
   * Get gallery images.
   */
  async getGallery(userId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    return prisma.providerGallery.findMany({
      where: { providerId: profile.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Delete a gallery image.
   */
  async deleteGalleryImage(userId: string, imageId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    const image = await prisma.providerGallery.findFirst({
      where: { id: imageId, providerId: profile.id },
    });

    if (!image) {
      throw ApiError.notFound('Gallery image not found');
    }

    await prisma.providerGallery.delete({ where: { id: imageId } });
  }

  /**
   * Search providers with filtering, sorting, and pagination.
   */
  async search(params: SearchProvidersInput) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    // Build dynamic where clause
    const where: Prisma.ProviderProfileWhereInput = {
      isAvailable: true,
      user: { isActive: true },
    };

    // City filter
    if (params.city) {
      where.city = { contains: params.city };
    }

    // Area filter
    if (params.area) {
      where.area = { contains: params.area };
    }

    // Rating filter
    if (params.minRating) {
      where.avgRating = { gte: params.minRating };
    }

    // Category filter via services
    if (params.category) {
      where.services = {
        some: {
          isActive: true,
          category: { slug: params.category },
        },
      };
    }

    // Price filter via services
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const priceFilter: Prisma.ServiceWhereInput = { isActive: true };
      if (params.minPrice !== undefined) {
        priceFilter.price = { ...(priceFilter.price as object), gte: params.minPrice };
      }
      if (params.maxPrice !== undefined) {
        priceFilter.price = { ...(priceFilter.price as object), lte: params.maxPrice };
      }
      where.services = { some: priceFilter };
    }

    // Keyword search
    if (params.q) {
      where.OR = [
        { user: { firstName: { contains: params.q } } },
        { user: { lastName: { contains: params.q } } },
        { bio: { contains: params.q } },
        { services: { some: { name: { contains: params.q }, isActive: true } } },
      ];
    }

    // Geo bounding box pre-filter
    if (params.lat !== undefined && params.lng !== undefined && params.radius) {
      const box = getBoundingBox(params.lat, params.lng, params.radius);
      where.latitude = { gte: box.minLat, lte: box.maxLat };
      where.longitude = { gte: box.minLng, lte: box.maxLng };
    }

    // Build orderBy
    let orderBy: Prisma.ProviderProfileOrderByWithRelationInput[] = [];
    switch (params.sort) {
      case 'rating':
        orderBy = [{ avgRating: 'desc' }, { totalReviews: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      default:
        orderBy = [{ avgRating: 'desc' }];
    }

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          services: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
              priceType: true,
              category: { select: { name: true, slug: true } },
            },
            take: 3,
          },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    // Apply Haversine distance filtering if geo search
    let result = providers;
    if (params.lat !== undefined && params.lng !== undefined) {
      result = providers
        .map((p) => ({
          ...p,
          distance: p.latitude && p.longitude
            ? haversineDistance(
                params.lat!,
                params.lng!,
                Number(p.latitude),
                Number(p.longitude)
              )
            : null,
        }))
        .filter((p) => {
          if (params.radius && p.distance !== null) {
            return p.distance <= params.radius;
          }
          return true;
        })
        .sort((a, b) => {
          if (params.sort === 'distance' && a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          return 0;
        });
    }

    return { providers: result, total, page, limit };
  }

  /**
   * Get reviews for a provider (public).
   */
  async getReviews(providerId: string, page?: number, limit?: number) {
    const { skip, take, page: pg, limit: lm } = parsePagination({ page, limit });

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId, isHidden: false },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.review.count({ where: { providerId, isHidden: false } }),
    ]);

    return { reviews, total, page: pg, limit: lm };
  }
}

export const providerService = new ProviderService();
