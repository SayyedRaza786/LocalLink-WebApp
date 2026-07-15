// =============================================================================
// Service Service — Business Logic Layer
// Handles CRUD for provider services and service images.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { Prisma, PriceType } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';
import {
  CreateServiceInput,
  UpdateServiceInput,
  AddServiceImageInput,
  ListServicesQuery,
} from './service.validation';

export class ServiceService {
  /**
   * List services with filters and pagination.
   */
  async list(params: ListServicesQuery) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.ServiceWhereInput = { isActive: true };

    // Category filter
    if (params.category) {
      where.category = { slug: params.category };
    }

    // Provider filter
    if (params.provider) {
      where.providerId = params.provider;
    }

    // Price range
    if (params.minPrice !== undefined) {
      where.price = { ...(where.price as object), gte: params.minPrice };
    }
    if (params.maxPrice !== undefined) {
      where.price = { ...(where.price as object), lte: params.maxPrice };
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          provider: {
            select: {
              id: true,
              avgRating: true,
              isVerified: true,
              user: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { services, total, page, limit };
  }

  /**
   * Get a single service by ID.
   */
  async getById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        provider: {
          select: {
            id: true,
            avgRating: true,
            totalReviews: true,
            isVerified: true,
            city: true,
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  /**
   * Create a new service (provider only).
   */
  async create(userId: string, input: CreateServiceInput) {
    // Get provider profile
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found. Create your profile first.');
    }

    // Verify category exists and is active
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true, isActive: true },
    });

    if (!category || !category.isActive) {
      throw ApiError.badRequest('Invalid or inactive category');
    }

    return prisma.service.create({
      data: {
        providerId: profile.id,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        priceType: input.priceType as PriceType,
        durationMinutes: input.durationMinutes ?? null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Update a service (owner only).
   */
  async update(userId: string, serviceId: string, input: UpdateServiceInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found or you do not own this service');
    }

    // Verify category if being changed
    if (input.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { isActive: true },
      });
      if (!category || !category.isActive) {
        throw ApiError.badRequest('Invalid or inactive category');
      }
    }

    return prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.priceType !== undefined && { priceType: input.priceType as PriceType }),
        ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /**
   * Delete a service (owner only, soft delete via isActive = false).
   */
  async delete(userId: string, serviceId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found or you do not own this service');
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        serviceId,
        status: { in: ['PENDING', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS'] },
      },
    });

    if (activeBookings > 0) {
      throw ApiError.badRequest(
        'Cannot delete a service with active bookings. Complete or cancel bookings first.'
      );
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });
  }

  /**
   * Add an image to a service.
   */
  async addImage(userId: string, serviceId: string, input: AddServiceImageInput) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found or you do not own this service');
    }

    return prisma.serviceImage.create({
      data: {
        serviceId,
        imageUrl: input.imageUrl,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  /**
   * Delete a service image.
   */
  async deleteImage(userId: string, serviceId: string, imageId: string) {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw ApiError.notFound('Provider profile not found.');
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: profile.id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found or you do not own this service');
    }

    const image = await prisma.serviceImage.findFirst({
      where: { id: imageId, serviceId },
    });

    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    await prisma.serviceImage.delete({ where: { id: imageId } });
  }
}

export const serviceService = new ServiceService();
