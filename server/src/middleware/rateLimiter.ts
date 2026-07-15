// =============================================================================
// Rate Limiter Configuration
// Prevents brute-force attacks and abuse.
// Separate limiters for auth endpoints (strict) and general API (relaxed).
// =============================================================================

import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for auth endpoints (login, register, forgot-password).
 * 20 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter for all API endpoints.
 * 200 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
