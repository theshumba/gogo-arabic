/**
 * Pagination utilities for consistent API response pagination
 */

/**
 * Calculate skip and limit values for MongoDB queries
 * @param {Object} options - Pagination options
 * @param {number} [options.page=1] - Page number (1-indexed)
 * @param {number} [options.limit=20] - Items per page
 * @returns {{ skip: number, limit: number }} MongoDB query params
 */
export function paginate({ page = 1, limit = 20 } = {}) {
  // Ensure page is at least 1
  const safePage = Math.max(1, parseInt(page, 10) || 1);

  // Ensure limit is between 1 and 100
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const skip = (safePage - 1) * safeLimit;

  return { skip, limit: safeLimit };
}

/**
 * Generate pagination metadata for API responses
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function paginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total: parseInt(total, 10),
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Parse pagination query parameters from request
 * @param {Object} query - Express req.query object
 * @returns {{ page: number, limit: number }} Parsed and validated pagination params
 */
export function parsePaginationQuery(query = {}) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;

  return { page, limit };
}
