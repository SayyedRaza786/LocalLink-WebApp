// =============================================================================
// Favorite Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { favoriteService } from './favorite.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class FavoriteController {
  /**
   * GET /api/v1/favorites
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await favoriteService.list(req.user!.userId, page, limit);
    return ApiResponse.paginated(
      res,
      result.favorites,
      result.total,
      result.page,
      result.limit,
      'Favorites retrieved successfully'
    );
  });

  /**
   * POST /api/v1/favorites/:providerId
   */
  add = asyncHandler(async (req: Request, res: Response) => {
    const favorite = await favoriteService.add(req.user!.userId, req.params.providerId as string);
    return ApiResponse.created(res, favorite, 'Added to favorites');
  });

  /**
   * DELETE /api/v1/favorites/:providerId
   */
  remove = asyncHandler(async (req: Request, res: Response) => {
    await favoriteService.remove(req.user!.userId, req.params.providerId as string);
    return ApiResponse.noContent(res);
  });
}

export const favoriteController = new FavoriteController();
