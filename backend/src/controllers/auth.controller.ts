import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createError } from '../middleware/errorHandler.js';
import { validatePassword } from '../utils/passwordValidation.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwtUtils.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

// In-memory refresh token storage (in production, use Redis)
const refreshTokenStore = new Set<string>();

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { firm: true },
    });

    if (!user || !user.isActive) {
      throw createError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw createError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = generateTokenPair(
      user.id,
      user.firmId,
      user.email,
      user.role
    );

    // Store refresh token (in production, use Redis with TTL)
    refreshTokenStore.add(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        firmId: user.firmId,
        firmName: user.firm.firmName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, firmName } = req.body;

    if (!email || !password || !firstName || !lastName || !firmName) {
      throw createError('All fields are required', 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw createError(passwordValidation.errors.join('; '), 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw createError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create firm and user in a transaction
    const result = await prisma.$transaction(async (_tx: Prisma.TransactionClient) => {
      const firm = await _tx.firm.create({
        data: {
          firmName,
          subscriptionTier: 'Basic',
        },
      });

      const user = await _tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: 'Admin', // First user is always admin
          firmId: firm.id,
        },
        include: { firm: true },
      });

      return { firm, user };
    });

    const { accessToken, refreshToken } = generateTokenPair(
      result.user.id,
      result.user.firmId,
      result.user.email,
      result.user.role
    );

    // Store refresh token
    refreshTokenStore.add(refreshToken);

    // Set httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        firmId: result.user.firmId,
        firmName: result.user.firm.firmName,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    const tokenToUse = token || cookieToken;

    if (!tokenToUse) {
      throw createError('Refresh token is required', 401);
    }

    // Verify token is in our store
    if (!refreshTokenStore.has(tokenToUse)) {
      throw createError('Invalid refresh token', 401);
    }

    // Verify token signature and expiration
    const decoded = verifyRefreshToken(tokenToUse);

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      decoded.sub,
      decoded.firmId,
      decoded.email,
      decoded.role
    );

    // Replace old refresh token with new one
    refreshTokenStore.delete(tokenToUse);
    refreshTokenStore.add(newRefreshToken);

    // Update cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    const tokenToUse = token || cookieToken;

    if (tokenToUse) {
      // Remove refresh token from store
      refreshTokenStore.delete(tokenToUse);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { firm: true },
    });

    if (!user || !user.isActive) {
      throw createError('User not found', 404);
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      firmId: user.firmId,
      firmName: user.firm.firmName,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    next(error);
  }
};
