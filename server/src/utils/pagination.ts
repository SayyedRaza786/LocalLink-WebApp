// =============================================================================
// Pagination Helper
// Standardizes pagination logic across all list endpoints.
// =============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters.
 * Returns Prisma-compatible skip/take values.
 */
export function parsePagination(params: PaginationParams): PaginationResult {
  const page = Math.max(1, params.page || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, params.limit || DEFAULT_LIMIT));

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
}
