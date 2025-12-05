import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/errorHandler.js';
import { successResponse } from '../utils/response.js';
import { sendRoleChangeEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

const VALID_ROLES = ['Admin', 'Attorney', 'Paralegal'];

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createError('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        firmId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        firm: {
          select: {
            id: true,
            firmName: true,
            firmAddress: true,
            contactEmail: true,
            contactPhone: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createError('Unauthorized', 401);
    }

    const { firstName, lastName, email } = req.body;

    // If email is being changed, check it's not already taken
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        throw createError('Email already in use', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        firmId: true,
        updatedAt: true,
      },
    });

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createError('Unauthorized', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('New password must be at least 8 characters', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw createError('Current password is incorrect', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    successResponse(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users
 * Get all users in the firm (admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    // Query parameters for filtering and pagination
    const { search, role, status, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: {
      firmId: string;
      role?: string;
      isActive?: boolean;
      OR?: Array<{
        firstName?: { contains: string; mode: 'insensitive' };
        lastName?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      firmId: req.user.firmId,
    };

    if (role && typeof role === 'string') {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    successResponse(res, {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get user details
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        firmId: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Users can only view users from their own firm
    if (user.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Update user details (admin only)
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;
    const { role, isActive } = req.body;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        firmId: true,
      },
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Users can only update users from their own firm
    if (existingUser.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    // Prevent deactivating yourself
    if (existingUser.id === req.user.userId && isActive === false) {
      throw createError('Cannot deactivate your own account', 400);
    }

    // Validate role if provided
    if (role && !VALID_ROLES.includes(role)) {
      throw createError(`Role must be one of: ${VALID_ROLES.join(', ')}`, 400);
    }

    // Build update data
    const updateData: {
      role?: string;
      isActive?: boolean;
    } = {};

    if (role !== undefined) {
      updateData.role = role;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send notification email if role changed
    if (role && role !== existingUser.role) {
      const adminUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { firstName: true, lastName: true },
      });

      if (adminUser) {
        const changedBy = `${adminUser.firstName} ${adminUser.lastName}`;
        await sendRoleChangeEmail(existingUser.email, role, changedBy);
      }
    }

    successResponse(res, { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete) (admin only)
 */
export const deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firmId: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Users can only deactivate users from their own firm
    if (existingUser.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    // Prevent deactivating yourself
    if (existingUser.id === req.user.userId) {
      throw createError('Cannot deactivate your own account', 400);
    }

    // Soft delete - just set isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    successResponse(res, { message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/:id/reactivate
 * Reactivate a deactivated user (admin only)
 */
export const reactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firmId: true,
        isActive: true,
      },
    });

    if (!existingUser) {
      throw createError('User not found', 404);
    }

    // Users can only reactivate users from their own firm
    if (existingUser.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    if (existingUser.isActive) {
      throw createError('User is already active', 400);
    }

    // Reactivate user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    successResponse(res, { user: updatedUser });
  } catch (error) {
    next(error);
  }
};
