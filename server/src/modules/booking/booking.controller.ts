// =============================================================================
// Booking Controller — HTTP Layer
// =============================================================================

import { Request, Response } from 'express';
import { bookingService } from './booking.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export class BookingController {
  /**
   * POST /api/v1/bookings
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.create(req.user!.userId, req.body);
    return ApiResponse.created(res, booking, 'Booking created successfully');
  });

  /**
   * GET /api/v1/bookings
   */
  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await bookingService.list(req.user!.userId, req.query as any);
    return ApiResponse.paginated(
      res,
      result.bookings,
      result.total,
      result.page,
      result.limit,
      'Bookings retrieved successfully'
    );
  });

  /**
   * GET /api/v1/bookings/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getById(req.user!.userId, req.params.id as string);
    return ApiResponse.success(res, booking, 'Booking retrieved successfully');
  });

  /**
   * PATCH /api/v1/bookings/:id/accept
   */
  accept = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.accept(req.user!.userId, req.params.id as string);
    return ApiResponse.success(res, booking, 'Booking accepted');
  });

  /**
   * PATCH /api/v1/bookings/:id/reject
   */
  reject = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.reject(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.success(res, booking, 'Booking rejected');
  });

  /**
   * PATCH /api/v1/bookings/:id/on-the-way
   */
  onTheWay = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.onTheWay(req.user!.userId, req.params.id as string);
    return ApiResponse.success(res, booking, 'Provider is on the way');
  });

  /**
   * PATCH /api/v1/bookings/:id/start
   */
  start = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.start(req.user!.userId, req.params.id as string);
    return ApiResponse.success(res, booking, 'Service started');
  });

  /**
   * PATCH /api/v1/bookings/:id/complete
   */
  complete = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.complete(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.success(res, booking, 'Service completed');
  });

  /**
   * PATCH /api/v1/bookings/:id/cancel
   */
  cancel = asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.cancel(req.user!.userId, req.params.id as string, req.body);
    return ApiResponse.success(res, booking, 'Booking cancelled');
  });
}

export const bookingController = new BookingController();
