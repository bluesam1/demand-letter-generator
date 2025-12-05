import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler.js';
import { verifyAccessToken, TokenPayload } from '../utils/jwtUtils.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    firmId: string;
    role: string;
    email: string;
  };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded: TokenPayload = verifyAccessToken(token);

    req.user = {
      id: decoded.sub,
      userId: decoded.sub,
      firmId: decoded.firmId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401));
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Role-based authorization middleware
 * Usage: authorize('Admin', 'Attorney')
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Firm isolation middleware - ensures users can only access their firm's data
 * Add this to routes that need firm-level data isolation
 */
export const enforceFirmIsolation = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Not authenticated', 401));
  }

  // Firm ID is already in req.user from authentication
  // This middleware serves as a marker that firm isolation is enforced
  // The actual filtering happens in the route handlers using req.user.firmId
  next();
};
