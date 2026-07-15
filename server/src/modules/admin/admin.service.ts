// =============================================================================
// Admin Service — Business Logic Layer
// Dashboard analytics, user management, provider verification, reports.
// =============================================================================

import { prisma } from '../../config/database';
import { ApiError } from '../../utils/ApiError';
import { Prisma, Role, ReportStatus, BookingStatus } from '@prisma/client';
import { parsePagination } from '../../utils/pagination';
import {
  UpdateUserStatusInput,
  VerifyProviderInput,
  ResolveReportInput,
  ListUsersQuery,
  ListProvidersQuery,
  ListReportsQuery,
} from './admin.validation';

export class AdminService {
  /**
   * Get dashboard analytics summary.
   */
  async getDashboard() {
    const [
      totalUsers,
      totalProviders,
      totalCustomers,
      totalBookings,
      activeBookings,
      completedBookings,
      pendingReports,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.PROVIDER } }),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: { status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY, BookingStatus.IN_PROGRESS] } },
      }),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Revenue proxy (sum of final prices of completed bookings)
    const revenueResult = await prisma.booking.aggregate({
      where: { status: BookingStatus.COMPLETED },
      _sum: { finalPrice: true },
    });

    return {
      totalUsers,
      totalProviders,
      totalCustomers,
      totalBookings,
      activeBookings,
      completedBookings,
      pendingReports,
      newUsersLast30Days: recentUsers,
      totalRevenue: revenueResult._sum.finalPrice ?? 0,
    };
  }

  /**
   * List all users with search and filters.
   */
  async listUsers(params: ListUsersQuery) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.UserWhereInput = {};

    if (params.role) {
      where.role = params.role as Role;
    }

    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
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
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Activate or suspend a user.
   */
  async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Cannot suspend yourself
    if (user.role === Role.ADMIN) {
      throw ApiError.badRequest('Cannot modify admin accounts');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: input.isActive },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });
  }

  /**
   * List providers with verification status.
   */
  async listProviders(params: ListProvidersQuery) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.ProviderProfileWhereInput = {};

    if (params.isVerified !== undefined) {
      where.isVerified = params.isVerified === 'true';
    }

    if (params.search) {
      where.user = {
        OR: [
          { firstName: { contains: params.search } },
          { lastName: { contains: params.search } },
          { email: { contains: params.search } },
        ],
      };
    }

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isActive: true,
              createdAt: true,
            },
          },
          _count: { select: { services: true, bookingsAsProvider: true } },
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return { providers, total, page, limit };
  }

  /**
   * Verify or unverify a provider.
   */
  async verifyProvider(providerId: string, input: VerifyProviderInput) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw ApiError.notFound('Provider not found');
    }

    return prisma.providerProfile.update({
      where: { id: providerId },
      data: { isVerified: input.isVerified },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  /**
   * List reports with status filter.
   */
  async listReports(params: ListReportsQuery) {
    const { skip, take, page, limit } = parsePagination({
      page: params.page,
      limit: params.limit,
    });

    const where: Prisma.ReportWhereInput = {};

    if (params.status) {
      where.status = params.status as ReportStatus;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          reportedUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          reportedReview: {
            select: { id: true, rating: true, comment: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total, page, limit };
  }

  /**
   * Resolve or dismiss a report.
   */
  async resolveReport(reportId: string, input: ResolveReportInput) {
    const report = await prisma.report.findUnique({ where: { id: reportId } });

    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    return prisma.report.update({
      where: { id: reportId },
      data: {
        status: input.status as ReportStatus,
        adminNotes: input.adminNotes ?? null,
        resolvedAt: ['RESOLVED', 'DISMISSED'].includes(input.status) ? new Date() : null,
      },
      include: {
        reporter: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }
}

export const adminService = new AdminService();
