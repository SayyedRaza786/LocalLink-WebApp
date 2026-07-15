// =============================================================================
// Category Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { categoryService } from './category.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class CategoryController {
  /**
   * GET /api/v1/categories — List active categories (public)
   */
  listActive = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.listActive();
    return ApiResponse.success(res, categories, 'Categories retrieved successfully');
  });

  /**
   * GET /api/v1/categories/all — List all categories (admin)
   */
  listAll = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.listAll();
    return ApiResponse.success(res, categories, 'All categories retrieved successfully');
  });

  /**
   * GET /api/v1/categories/:slug
   */
  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getBySlug(req.params.slug as string);
    return ApiResponse.success(res, category, 'Category retrieved successfully');
  });

  /**
   * POST /api/v1/categories — Admin only
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    return ApiResponse.created(res, category, 'Category created successfully');
  });

  /**
   * PATCH /api/v1/categories/:id — Admin only
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id as string, req.body);
    return ApiResponse.success(res, category, 'Category updated successfully');
  });

  /**
   * DELETE /api/v1/categories/:id — Admin only (soft delete)
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await categoryService.delete(req.params.id as string);
    return ApiResponse.noContent(res);
  });
}

export const categoryController = new CategoryController();
