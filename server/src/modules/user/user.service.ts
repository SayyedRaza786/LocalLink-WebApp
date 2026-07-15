// =============================================================================
// User Service — Business Logic Layer
// Handles profile retrieval, updates, and password changes.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, comparePassword } from '../../utils/hash';
import { UpdateProfileInput, ChangePasswordInput } from './user.validation';

// Safe user fields — never expose passwordHash
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
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UserService {
  /**
   * Get the current authenticated user's profile.
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userSelectFields,
        providerProfile: {
          select: {
            id: true,
            bio: true,
            experienceYears: true,
            city: true,
            area: true,
            isVerified: true,
            avgRating: true,
            totalReviews: true,
            totalBookings: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update the current user's profile.
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    // Check if phone is already taken by another user
    if (input.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: input.phone },
      });

      if (existingPhone && existingPhone.id !== userId) {
        throw ApiError.conflict('This phone number is already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: userSelectFields,
    });

    return user;
  }

  /**
   * Change the user's password.
   * Requires the current password for verification.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isCurrentValid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    // Don't allow same password
    const isSamePassword = await comparePassword(input.newPassword, user.passwordHash);
    if (isSamePassword) {
      throw ApiError.badRequest('New password must be different from current password');
    }

    // Hash and update
    const newHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }
}

export const userService = new UserService();
