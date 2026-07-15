// =============================================================================
// ApiResponse — Standardized response wrapper
// Ensures every API response follows the same envelope structure.
// =============================================================================

import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  /**
   * Send a success response.
   */
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta
  ) {
    const response: Record<string, unknown> = {
      success: true,
      message,
      data,
    };

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201).
   */
  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Send a no-content response (204).
   */
  static noContent(res: Response) {
    return res.status(204).send();
  }

  /**
   * Send a paginated response.
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success'
  ) {
    return ApiResponse.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
