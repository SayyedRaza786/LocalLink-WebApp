// =============================================================================
// Auth Service — Business Logic Layer
// Handles registration, login, token refresh, logout, and password reset.
// No HTTP concerns here — pure business logic and data access.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, comparePassword } from '../../utils/hash';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';
import { Role } from '@prisma/client';

// Fields to exclude from user responses — never expose sensitive data
const userSelectFields = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
} as const;

export class AuthService {
  /**
   * Register a new user.
   * 1. Check if email already exists.
   * 2. Hash the password.
   * 3. Create the user record.
   * 4. Generate access and refresh tokens.
   * 5. Store refresh token hash in DB.
   */
  async register(input: RegisterInput) {
    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role as Role,
      },
      select: userSelectFields,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenData = generateRefreshToken();

    // Store refresh token hash
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenData.hash,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user,
      accessToken,
      refreshToken: refreshTokenData.token,
    };
  }

  /**
   * Log in an existing user.
   * 1. Find user by email.
   * 2. Verify password.
   * 3. Check if account is active.
   * 4. Generate new tokens.
   * 5. Update last login timestamp.
   */
  async login(input: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      // Use generic message to prevent email enumeration
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been suspended. Please contact support.');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshTokenData = generateRefreshToken();

    // Store refresh token hash + update last login
    await Promise.all([
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenData.hash,
          expiresAt: getRefreshTokenExpiry(),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    // Return user without sensitive fields
    const { passwordHash: _, ...safeUser } = user;

    return {
      user: safeUser,
      accessToken,
      refreshToken: refreshTokenData.token,
    };
  }

  /**
   * Refresh the access token using a valid refresh token.
   * 1. Hash the incoming token.
   * 2. Find matching token record in DB.
   * 3. Check if it's valid (not revoked, not expired).
   * 4. Rotate: revoke old token, issue new pair.
   *
   * Token rotation detects theft: if a stolen token is used after the
   * legitimate user has already rotated it, the old token won't be found
   * (it's revoked), triggering a security alert.
   */
  async refreshAccessToken(rawRefreshToken: string) {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Find the refresh token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: userSelectFields } },
    });

    if (!storedToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (storedToken.isRevoked) {
      // Possible token theft — revoke ALL tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      });
      throw ApiError.unauthorized('Refresh token has been revoked. Please log in again.');
    }

    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
    }

    if (!storedToken.user.isActive) {
      throw ApiError.forbidden('Your account has been suspended.');
    }

    // Rotate: revoke old, issue new
    const newRefreshTokenData = generateRefreshToken();

    await Promise.all([
      // Revoke old token
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      }),
      // Create new token
      prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          tokenHash: newRefreshTokenData.hash,
          expiresAt: getRefreshTokenExpiry(),
        },
      }),
    ]);

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenData.token,
    };
  }

  /**
   * Log out — revoke the refresh token.
   */
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) return;

    const tokenHash = hashRefreshToken(rawRefreshToken);

    // Revoke the token (ignore if not found — idempotent)
    await prisma.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke ALL refresh tokens for a user (e.g., "log out everywhere").
   */
  async revokeAllTokens(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}

export const authService = new AuthService();
