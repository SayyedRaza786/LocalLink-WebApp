// =============================================================================
// Provider Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { providerService } from './provider.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class ProviderController {
  /**
   * GET /api/v1/providers — Search/list providers (public)
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const result = await providerService.search(req.query as any);
    return ApiResponse.paginated(
      res,
      result.providers,
      result.total,
      result.page,
      result.limit,
      'Providers retrieved successfully'
    );
  });

  /**
   * GET /api/v1/providers/:id — Get provider public profile
   */
  getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const provider = await providerService.getPublicProfile(req.params.id as string);
    return ApiResponse.success(res, provider, 'Provider profile retrieved successfully');
  });

  /**
   * GET /api/v1/providers/me/profile — Get own profile (provider only)
   */
  getOwnProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await providerService.getOwnProfile(req.user!.userId);
    return ApiResponse.success(res, profile, 'Profile retrieved successfully');
  });

  /**
   * PUT /api/v1/providers/me/profile — Create/update own profile
   */
  upsertProfile = asyncHandler(async (req: Request, res: Response) => {
    const profile = await providerService.upsertProfile(req.user!.userId, req.body);
    return ApiResponse.success(res, profile, 'Profile updated successfully');
  });

  /**
   * GET /api/v1/providers/me/availability
   */
  getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const slots = await providerService.getAvailability(req.user!.userId);
    return ApiResponse.success(res, slots, 'Availability retrieved successfully');
  });

  /**
   * PUT /api/v1/providers/me/availability
   */
  setAvailability = asyncHandler(async (req: Request, res: Response) => {
    const slots = await providerService.setAvailability(req.user!.userId, req.body);
    return ApiResponse.success(res, slots, 'Availability updated successfully');
  });

  /**
   * GET /api/v1/providers/me/gallery
   */
  getGallery = asyncHandler(async (req: Request, res: Response) => {
    const images = await providerService.getGallery(req.user!.userId);
    return ApiResponse.success(res, images, 'Gallery retrieved successfully');
  });

  /**
   * POST /api/v1/providers/me/gallery
   */
  addGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await providerService.addGalleryImage(req.user!.userId, req.body);
    return ApiResponse.created(res, image, 'Image added to gallery');
  });

  /**
   * DELETE /api/v1/providers/me/gallery/:imageId
   */
  deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
    await providerService.deleteGalleryImage(req.user!.userId, req.params.imageId as string);
    return ApiResponse.noContent(res);
  });

  /**
   * GET /api/v1/providers/:id/reviews
   */
  getReviews = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const result = await providerService.getReviews(req.params.id as string, page, limit);
    return ApiResponse.paginated(
      res,
      result.reviews,
      result.total,
      result.page,
      result.limit,
      'Reviews retrieved successfully'
    );
  });
}

export const providerController = new ProviderController();
