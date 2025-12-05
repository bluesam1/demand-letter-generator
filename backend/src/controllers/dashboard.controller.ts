import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    // Count letters by status
    const [
      totalLetters,
      draftCount,
      generatedCount,
      finalizedCount,
      exportedCount,
    ] = await Promise.all([
      prisma.demandLetter.count({ where: { firmId } }),
      prisma.demandLetter.count({ where: { firmId, status: 'Draft' } }),
      prisma.demandLetter.count({ where: { firmId, status: 'Generated' } }),
      prisma.demandLetter.count({ where: { firmId, status: 'Finalized' } }),
      prisma.demandLetter.count({ where: { firmId, status: 'Exported' } }),
    ]);

    res.json({
      stats: {
        total: totalLetters,
        draft: draftCount,
        generated: generatedCount,
        finalized: finalizedCount,
        exported: exportedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
