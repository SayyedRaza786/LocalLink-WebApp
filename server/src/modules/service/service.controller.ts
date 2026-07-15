// =============================================================================
// Service Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { serviceService } from './service.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class ServiceController {
  /**
   * GET /api/v1/services
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await serviceService.list(req.query as any);
    return ApiResponse.paginated(
      res,
      result.services,
      result.total,
      result.page,
      result.limit,
      'Services retrieved successfully'
    );
  });

  /**
   * GET /api/v1/services/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceService.getById(req.params.id as string);
    return ApiResponse.success(res, service, 'Service retrieved successfully');
  });

  /**
   * POST /api/v1/services
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceService.create(req.user!.userId, req.body);
    return ApiResponse.created(res, service, 'Service created successfully');
  });

  /**
   * PATCH /api/v1/services/:id
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const service = await serviceService.update(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.success(res, service, 'Service updated successfully');
  });

  /**
   * DELETE /api/v1/services/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    await serviceService.delete(req.user!.userId, req.params.id as string);
    return ApiResponse.noContent(res);
  });

  /**
   * POST /api/v1/services/:id/images
   */
  addImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await serviceService.addImage(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.created(res, image, 'Image added successfully');
  });

  /**
   * DELETE /api/v1/services/:id/images/:imageId
   */
  deleteImage = asyncHandler(async (req: Request, res: Response) => {
    await serviceService.deleteImage(req.user!.userId, req.params.id as string, req.params.imageId as string);
    return ApiResponse.noContent(res);
  });
}

export const serviceController = new ServiceController();
