// =============================================================================
// Category Service — Business Logic Layer
// CRUD operations for service categories.
// Categories are managed by admins, read by everyone.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';

export class CategoryService {
  /**
   * List all active categories (public).
   * Returns sorted by sortOrder, then name.
   */
  async listActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * List all categories including inactive (admin).
   */
  async listAll() {
    return prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { services: true } },
      },
    });
  }

  /**
   * Get a single category by slug (public).
   */
  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    return category;
  }

  /**
   * Create a new category (admin).
   */
  async create(input: CreateCategoryInput) {
    // Check for duplicate name
    const existingName = await prisma.category.findUnique({
      where: { name: input.name },
    });
    if (existingName) {
      throw ApiError.conflict('A category with this name already exists');
    }

    // Check for duplicate slug
    const existingSlug = await prisma.category.findUnique({
      where: { slug: input.slug },
    });
    if (existingSlug) {
      throw ApiError.conflict('A category with this slug already exists');
    }

    return prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        icon: input.icon ?? null,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  /**
   * Update a category (admin).
   */
  async update(id: string, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    // Check for duplicate name if name is being changed
    if (input.name && input.name !== category.name) {
      const existingName = await prisma.category.findUnique({
        where: { name: input.name },
      });
      if (existingName) {
        throw ApiError.conflict('A category with this name already exists');
      }
    }

    // Check for duplicate slug if slug is being changed
    if (input.slug && input.slug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) {
        throw ApiError.conflict('A category with this slug already exists');
      }
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.slug !== undefined && { slug: input.slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.icon !== undefined && { icon: input.icon }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });
  }

  /**
   * Soft-delete a category (admin).
   * Sets isActive to false. Checks for active services first.
   */
  async delete(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { services: { where: { isActive: true } } } } },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (category._count.services > 0) {
      throw ApiError.badRequest(
        `Cannot delete category with ${category._count.services} active service(s). Deactivate services first.`
      );
    }

    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const categoryService = new CategoryService();
