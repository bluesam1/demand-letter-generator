import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/errorHandler.js';
import { exportService } from '../services/exportService.js';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

/**
 * Export a demand letter to Word format
 * POST /api/letters/:id/export
 */
export const exportLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const { includeLetterhead = true } = req.body;

    // Fetch letter with firm and user data
    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
      include: {
        firm: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    if (!letter.content) {
      throw createError('Cannot export letter without content. Please generate the letter first.', 400);
    }

    // Prepare letter data for export
    const letterData = {
      clientName: letter.clientName,
      defendantName: letter.defendantName,
      caseReference: letter.caseReference || undefined,
      incidentDate: letter.incidentDate || undefined,
      demandAmount: letter.demandAmount ? Number(letter.demandAmount) : undefined,
      content: letter.content,
      createdAt: letter.createdAt,
    };

    // Prepare export options
    const exportOptions = {
      includeLetterhead,
      firmName: letter.firm.firmName,
      firmAddress: letter.firm.firmAddress || undefined,
      firmPhone: letter.firm.contactPhone || undefined,
      firmEmail: letter.firm.contactEmail || undefined,
      attorneyName: `${letter.createdBy.firstName} ${letter.createdBy.lastName}`,
      attorneyTitle: 'Attorney at Law',
    };

    // Generate Word document
    const result = await exportService.generateWordDocument(letterData, exportOptions);

    // Save export record to database
    const exportRecord = await prisma.export.create({
      data: {
        letterId: id,
        exportedById: userId,
        exportFormat: 'docx',
        fileName: result.fileName,
        storagePath: result.filePath,
        fileSize: BigInt(result.fileSize),
      },
    });

    res.status(201).json({
      export: {
        id: exportRecord.id,
        fileName: result.fileName,
        fileSize: result.fileSize,
        format: 'docx',
        exportedAt: exportRecord.exportedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all exports for a letter
 * GET /api/letters/:id/exports
 */
export const getLetterExports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    // Verify letter belongs to firm
    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    // Fetch all exports for this letter
    const exports = await prisma.export.findMany({
      where: { letterId: id },
      orderBy: { exportedAt: 'desc' },
      include: {
        exportedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Convert BigInt to number for JSON serialization
    const exportsJson = exports.map((exp) => ({
      id: exp.id,
      fileName: exp.fileName,
      format: exp.exportFormat,
      fileSize: Number(exp.fileSize),
      exportedAt: exp.exportedAt,
      exportedBy: exp.exportedBy,
    }));

    res.json({ exports: exportsJson });
  } catch (error) {
    next(error);
  }
};

/**
 * Download an exported file
 * GET /api/exports/:id/download
 */
export const downloadExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    // Fetch export record with letter to verify firm access
    const exportRecord = await prisma.export.findFirst({
      where: { id },
      include: {
        letter: true,
      },
    });

    if (!exportRecord) {
      throw createError('Export not found', 404);
    }

    // Verify user has access (same firm)
    if (exportRecord.letter.firmId !== firmId) {
      throw createError('Unauthorized to access this export', 403);
    }

    // Check if file exists
    const fileExists = await exportService.exportExists(exportRecord.storagePath);
    if (!fileExists) {
      throw createError('Export file no longer available', 404);
    }

    // Determine content type based on format
    let contentType = 'application/octet-stream';
    if (exportRecord.exportFormat === 'docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (exportRecord.exportFormat === 'pdf') {
      contentType = 'application/pdf';
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);

    // Read and send file
    const fileBuffer = await fs.readFile(exportRecord.storagePath);
    res.send(fileBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an export
 * DELETE /api/exports/:id
 */
export const deleteExport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    // Fetch export record with letter to verify firm access
    const exportRecord = await prisma.export.findFirst({
      where: { id },
      include: {
        letter: true,
      },
    });

    if (!exportRecord) {
      throw createError('Export not found', 404);
    }

    // Verify user has access (same firm)
    if (exportRecord.letter.firmId !== firmId) {
      throw createError('Unauthorized to delete this export', 403);
    }

    // Delete file from filesystem
    await exportService.deleteExport(exportRecord.storagePath);

    // Delete database record
    await prisma.export.delete({ where: { id } });

    res.json({ message: 'Export deleted successfully' });
  } catch (error) {
    next(error);
  }
};
