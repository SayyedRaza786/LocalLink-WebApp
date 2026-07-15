// =============================================================================
// JWT Utilities
// Handles access token and refresh token generation and verification.
// Access tokens are short-lived (15min). Refresh tokens are long-lived (7d).
// =============================================================================

import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
}

/**
 * Generate a short-lived access token (15min default).
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
}

/**
 * Generate a long-lived refresh token (7d default).
 * Returns both the raw token (sent to client) and its hash (stored in DB).
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Verify an access token and return the payload.
 * Throws if token is expired or invalid.
 */
export function verifyAccessToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload & TokenPayload;
  return {
    userId: payload.userId,
    role: payload.role,
  };
}

/**
 * Hash a refresh token for database storage.
 * Never store raw tokens — only compare hashes.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calculate the expiry date for a refresh token.
 */
export function getRefreshTokenExpiry(): Date {
  const match = env.JWT_REFRESH_EXPIRY.match(/^(\d+)([dhms])$/);
  if (!match) {
    // Default to 7 days if parsing fails
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * (multipliers[unit] || 24 * 60 * 60 * 1000));
}
