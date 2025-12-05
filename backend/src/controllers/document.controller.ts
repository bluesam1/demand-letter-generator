import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/connection.js';
import { textExtractionService } from '../services/textExtraction.service.js';
import fs from 'fs/promises';

const prisma = getPrismaClient();

/**
 * Upload document(s) to a letter
 * POST /api/documents/upload
 */
export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { letterId } = req.body;

    if (!files || files.length === 0) {
      return errorResponse(res, 'VALIDATION_ERROR', 'No files provided', 400);
    }

    if (!letterId) {
      return errorResponse(res, 'VALIDATION_ERROR', 'Letter ID is required', 400);
    }

    // Verify letter exists and user has access
    const letter = await prisma.demandLetter.findFirst({
      where: {
        id: letterId,
        firmId: req.user!.firmId
      }
    });

    if (!letter) {
      return errorResponse(res, 'NOT_FOUND', 'Letter not found', 404);
    }

    // Process each uploaded file
    const documents = await Promise.all(
      files.map(async (file) => {
        // Extract text from the document
        let extractedText: string | null = null;
        let processingStatus = 'Pending';
        let processedAt: Date | null = null;

        try {
          extractedText = await textExtractionService.extractText(file.path, file.mimetype);

          // Validate text quality
          if (textExtractionService.validateTextQuality(extractedText)) {
            processingStatus = 'Completed';
            processedAt = new Date();
          } else {
            processingStatus = 'Failed';
            extractedText = null;
          }
        } catch (error) {
          processingStatus = 'Failed';
          console.error('Text extraction failed:', error);
        }

        // Save document record to database
        const document = await prisma.sourceDocument.create({
          data: {
            letterId,
            uploadedById: req.user!.id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: BigInt(file.size),
            storagePath: file.path,
            extractedText,
            processingStatus,
            processedAt
          }
        });

        return {
          id: document.id,
          fileName: document.fileName,
          fileType: document.fileType,
          fileSize: Number(document.fileSize),
          processingStatus: document.processingStatus,
          uploadedAt: document.uploadedAt
        };
      })
    );

    successResponse(res, { documents }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents for a letter
 * GET /api/documents
 */
export const getDocumentsByLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { letterId } = req.query;

    if (!letterId || typeof letterId !== 'string') {
      return errorResponse(res, 'VALIDATION_ERROR', 'Letter ID is required', 400);
    }

    // Verify letter exists and user has access
    const letter = await prisma.demandLetter.findFirst({
      where: {
        id: letterId,
        firmId: req.user!.firmId
      }
    });

    if (!letter) {
      return errorResponse(res, 'NOT_FOUND', 'Letter not found', 404);
    }

    // Get all documents for the letter
    const documents = await prisma.sourceDocument.findMany({
      where: {
        letterId
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        documentType: true,
        processingStatus: true,
        uploadedAt: true,
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    const formattedDocuments = documents.map((doc: {
      id: string;
      fileName: string;
      fileType: string;
      fileSize: bigint;
      documentType: string | null;
      processingStatus: string;
      uploadedAt: Date;
      uploadedBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }) => ({
      ...doc,
      fileSize: Number(doc.fileSize)
    }));

    successResponse(res, { documents: formattedDocuments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific document by ID
 * GET /api/documents/:id
 */
export const getDocumentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await prisma.sourceDocument.findFirst({
      where: {
        id,
        letter: {
          firmId: req.user!.firmId
        }
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!document) {
      return errorResponse(res, 'NOT_FOUND', 'Document not found', 404);
    }

    successResponse(res, {
      document: {
        ...document,
        fileSize: Number(document.fileSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Find document and verify access
    const document = await prisma.sourceDocument.findFirst({
      where: {
        id,
        letter: {
          firmId: req.user!.firmId
        }
      }
    });

    if (!document) {
      return errorResponse(res, 'NOT_FOUND', 'Document not found', 404);
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.storagePath);
    } catch (error) {
      console.error('Failed to delete file from filesystem:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete document record from database
    await prisma.sourceDocument.delete({
      where: { id }
    });

    successResponse(res, { message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};
