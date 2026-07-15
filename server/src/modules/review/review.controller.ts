// =============================================================================
// Review Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { reviewService } from './review.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class ReviewController {
  /**
   * POST /api/v1/reviews
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.create(req.user!.userId, req.body);
    return ApiResponse.created(res, review, 'Review created successfully');
  });

  /**
   * PATCH /api/v1/reviews/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewService.update(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.success(res, review, 'Review updated successfully');
  });

  /**
   * DELETE /api/v1/reviews/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await reviewService.delete(req.user!.userId, req.params.id as string);
    return ApiResponse.noContent(res);
  });
}

export const reviewController = new ReviewController();
