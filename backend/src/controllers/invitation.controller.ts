import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { generateInvitationToken } from '../utils/tokenGenerator.js';
import { sendInvitationEmail } from '../services/emailService.js';
import { validatePassword } from '../utils/passwordValidation.js';
import { generateTokenPair } from '../utils/jwtUtils.js';

const prisma = new PrismaClient();

const INVITATION_EXPIRY_DAYS = 7;
const VALID_ROLES = ['Admin', 'Attorney', 'Paralegal'];

/**
 * POST /api/users/invite
 * Admin-only endpoint to invite new users to the firm
 */
export const inviteUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { emails, role } = req.body;

    // Validate input
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw createError('Emails array is required', 400);
    }

    if (!role || !VALID_ROLES.includes(role)) {
      throw createError(`Role must be one of: ${VALID_ROLES.join(', ')}`, 400);
    }

    // Get firm details for email
    const firm = await prisma.firm.findUnique({
      where: { id: req.user.firmId },
    });

    if (!firm) {
      throw createError('Firm not found', 404);
    }

    const results = [];

    for (const email of emails) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.push({ email, status: 'error', message: 'Invalid email format' });
        continue;
      }

      // Check for existing user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        results.push({ email, status: 'error', message: 'User already exists' });
        continue;
      }

      // Check for pending invitation
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          email,
          firmId: req.user.firmId,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        results.push({ email, status: 'error', message: 'Invitation already pending' });
        continue;
      }

      // Create invitation
      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

      try {
        const invitation = await prisma.invitation.create({
          data: {
            email,
            firmId: req.user.firmId,
            role,
            token,
            createdBy: req.user.userId,
            expiresAt,
          },
        });

        // Send invitation email
        const activationUrl = `${process.env.APP_URL || 'http://localhost:5174'}/accept-invitation?token=${token}`;
        await sendInvitationEmail({
          email,
          activationUrl,
          firmName: firm.firmName,
          role,
          expiresAt,
        });

        results.push({
          email,
          status: 'success',
          invitationId: invitation.id,
          expiresAt: invitation.expiresAt,
        });
      } catch (error) {
        console.error('Failed to send invitation email:', error);
        results.push({ email, status: 'error', message: 'Failed to send invitation email' });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/accept-invitation
 * Accept an invitation and create user account
 */
export const acceptInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, password, firstName, lastName } = req.body;

    if (!token || !password || !firstName || !lastName) {
      throw createError('All fields are required', 400);
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw createError(passwordValidation.errors.join('; '), 400);
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { firm: true },
    });

    if (!invitation) {
      throw createError('Invalid invitation token', 400);
    }

    if (invitation.acceptedAt) {
      throw createError('Invitation already accepted', 400);
    }

    if (invitation.expiresAt < new Date()) {
      throw createError('Invitation has expired', 400);
    }

    // Check if user already exists (race condition protection)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Create user and mark invitation as accepted in a transaction
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          firmId: invitation.firmId,
          role: invitation.role,
        },
        include: { firm: true },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
          token: null, // Invalidate token
        },
      });

      return user;
    });

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokenPair(
      result.id,
      result.firmId,
      result.email,
      result.role
    );

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
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
        firmId: result.firmId,
        firmName: result.firm.firmName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/invitations
 * Get all pending invitations for the firm (admin only)
 */
export const getInvitations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        firmId: req.user.firmId,
        acceptedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add isExpired status to each invitation
    const invitationsWithStatus = invitations.map(inv => ({
      ...inv,
      isExpired: inv.expiresAt < new Date(),
    }));

    res.json({ invitations: invitationsWithStatus });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/invitations/:id
 * Cancel a pending invitation (admin only)
 */
export const cancelInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Check invitation exists and belongs to the firm
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw createError('Invitation not found', 404);
    }

    if (invitation.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    if (invitation.acceptedAt) {
      throw createError('Cannot cancel accepted invitation', 400);
    }

    await prisma.invitation.delete({
      where: { id },
    });

    res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/invitations/:id/resend
 * Resend an invitation (admin only)
 */
export const resendInvitation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Check invitation exists and belongs to the firm
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { firm: true },
    });

    if (!invitation) {
      throw createError('Invitation not found', 404);
    }

    if (invitation.firmId !== req.user.firmId) {
      throw createError('Access denied', 403);
    }

    if (invitation.acceptedAt) {
      throw createError('Cannot resend accepted invitation', 400);
    }

    // Generate new token and extend expiration
    const newToken = generateInvitationToken();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
      },
    });

    // Resend email
    const activationUrl = `${process.env.APP_URL || 'http://localhost:5174'}/accept-invitation?token=${newToken}`;
    await sendInvitationEmail({
      email: invitation.email,
      activationUrl,
      firmName: invitation.firm.firmName,
      role: invitation.role,
      expiresAt: newExpiresAt,
    });

    res.json({
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        expiresAt: updatedInvitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
