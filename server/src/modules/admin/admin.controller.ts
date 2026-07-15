// =============================================================================
// Admin Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class AdminController {
  /**
   * GET /api/v1/admin/dashboard
   */
  getDashboard = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getDashboard();
    return ApiResponse.success(res, stats, 'Dashboard stats retrieved');
  });

  /**
   * GET /api/v1/admin/users
   */
  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listUsers(req.query as any);
    return ApiResponse.paginated(
      res,
      result.users,
      result.total,
      result.page,
      result.limit,
      'Users retrieved successfully'
    );
  });

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(req.params.id as string, req.body);
    return ApiResponse.success(res, user, 'User status updated');
  });

  /**
   * GET /api/v1/admin/providers
   */
  listProviders = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listProviders(req.query as any);
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
   * PATCH /api/v1/admin/providers/:id/verify
   */
  verifyProvider = asyncHandler(async (req: Request, res: Response) => {
    const provider = await adminService.verifyProvider(req.params.id as string, req.body);
    return ApiResponse.success(res, provider, 'Provider verification updated');
  });

  /**
   * GET /api/v1/admin/reports
   */
  listReports = asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listReports(req.query as any);
    return ApiResponse.paginated(
      res,
      result.reports,
      result.total,
      result.page,
      result.limit,
      'Reports retrieved successfully'
    );
  });

  /**
   * PATCH /api/v1/admin/reports/:id
   */
  resolveReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await adminService.resolveReport(req.params.id as string, req.body);
    return ApiResponse.success(res, report, 'Report updated');
  });
}

export const adminController = new AdminController();
