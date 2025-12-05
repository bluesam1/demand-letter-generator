import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/errorHandler.js';
import { aiService } from '../services/aiService.js';

const prisma = new PrismaClient();

export const getAllLetters = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    // Query parameters
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const sortBy = req.query.sortBy as string || 'updatedAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Build where clause
    const where: Prisma.DemandLetterWhereInput = { firmId };

    // Add search filter
    if (search) {
      where.OR = [
        { clientName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { defendantName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { caseReference: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Build order by clause
    const orderBy: Prisma.DemandLetterOrderByWithRelationInput = {};
    const sortOrderEnum = sortOrder === 'asc' ? Prisma.SortOrder.asc : Prisma.SortOrder.desc;

    if (sortBy === 'client') {
      orderBy.clientName = sortOrderEnum;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrderEnum;
    } else if (sortBy === 'created') {
      orderBy.createdAt = sortOrderEnum;
    } else {
      orderBy.updatedAt = sortOrderEnum;
    }

    // Get total count for pagination
    const total = await prisma.demandLetter.count({ where });

    // Get letters
    const letters = await prisma.demandLetter.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      select: {
        id: true,
        clientName: true,
        defendantName: true,
        status: true,
        caseReference: true,
        demandAmount: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      letters,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLetterById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
      include: {
        template: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        sourceDocuments: true,
      },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    res.json({ letter });
  } catch (error) {
    next(error);
  }
};

export const createLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const { clientName, defendantName, templateId, caseReference, incidentDate, demandAmount } =
      req.body;

    if (!clientName || !defendantName) {
      throw createError('Client name and defendant name are required', 400);
    }

    const letter = await prisma.demandLetter.create({
      data: {
        firmId,
        createdById: userId,
        clientName,
        defendantName,
        templateId: templateId || null,
        caseReference: caseReference || null,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        demandAmount: demandAmount || null,
        status: 'Draft',
      },
    });

    res.status(201).json({ letter });
  } catch (error) {
    next(error);
  }
};

export const updateLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const existingLetter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
    });

    if (!existingLetter) {
      throw createError('Letter not found', 404);
    }

    if (existingLetter.status === 'Finalized') {
      throw createError('Cannot update finalized letter', 400);
    }

    const { clientName, defendantName, content, status, caseReference, incidentDate, demandAmount } =
      req.body;

    const letter = await prisma.demandLetter.update({
      where: { id },
      data: {
        ...(clientName && { clientName }),
        ...(defendantName && { defendantName }),
        ...(content !== undefined && { content }),
        ...(status && { status }),
        ...(caseReference !== undefined && { caseReference }),
        ...(incidentDate !== undefined && { incidentDate: new Date(incidentDate) }),
        ...(demandAmount !== undefined && { demandAmount }),
      },
    });

    res.json({ letter });
  } catch (error) {
    next(error);
  }
};

export const deleteLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const existingLetter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
    });

    if (!existingLetter) {
      throw createError('Letter not found', 404);
    }

    await prisma.demandLetter.delete({ where: { id } });

    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const generateLetter = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    // Fetch letter with all related data
    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
      include: {
        template: true,
        sourceDocuments: {
          where: {
            processingStatus: 'Completed',
          },
        },
      },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    // Validate that letter has source documents
    if (!letter.sourceDocuments || letter.sourceDocuments.length === 0) {
      throw createError(
        'Cannot generate letter without source documents. Please upload at least one document.',
        400
      );
    }

    // Check if documents have extracted text
    const documentsWithText = letter.sourceDocuments.filter((doc) => doc.extractedText);
    if (documentsWithText.length === 0) {
      throw createError(
        'No extracted text available from source documents. Please wait for document processing to complete.',
        400
      );
    }

    // Extract text from all source documents
    const sourceTexts = documentsWithText.map((doc) => doc.extractedText || '').filter((text) => text.length > 0);

    // Get template content if template is selected
    let templateContent: string | undefined;
    if (letter.template) {
      // Template content is stored as JSON, extract the text content
      const templateJson = letter.template.templateContent as Record<string, unknown>;
      if (typeof templateJson === 'string') {
        templateContent = templateJson;
      } else if (typeof templateJson === 'object' && templateJson.content && typeof templateJson.content === 'string') {
        templateContent = templateJson.content;
      }
    }

    // Prepare letter data for AI generation
    const metadata = letter.metadata as Record<string, unknown>;
    const letterData = {
      clientName: letter.clientName,
      defendantName: letter.defendantName,
      incidentDate: letter.incidentDate ? letter.incidentDate.toISOString() : null,
      demandAmount: letter.demandAmount ? Number(letter.demandAmount) : null,
      caseReference: letter.caseReference,
      // Extract additional info from metadata if present
      injuries: typeof metadata?.injuries === 'string' ? metadata.injuries : undefined,
      damages: typeof metadata?.damages === 'string' ? metadata.damages : undefined,
    };

    // Generate letter using AI service
    const startTime = Date.now();
    const result = await aiService.generateLetter(letterData, sourceTexts, templateContent);
    const processingTimeMs = Date.now() - startTime;

    // Calculate cost
    const cost = aiService.calculateCost(result.inputTokens, result.outputTokens);

    // Save generated content to letter
    const updatedLetter = await prisma.demandLetter.update({
      where: { id },
      data: {
        content: result.content,
        status: 'Generated',
      },
    });

    // Log AI refinement record for tracking
    await prisma.aIRefinement.create({
      data: {
        letterId: id,
        requestedById: userId,
        instruction: 'Initial letter generation',
        aiModel: result.model,
        inputContent: `Source documents: ${sourceTexts.length} documents`,
        outputContent: result.content,
        status: 'Completed',
        processingTimeMs,
        tokenCount: result.inputTokens + result.outputTokens,
      },
    });

    res.json({
      letter: updatedLetter,
      generation: {
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        totalTokens: result.inputTokens + result.outputTokens,
        model: result.model,
        processingTimeMs,
        estimatedCost: cost,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLetterVersions = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const versions = await prisma.letterVersion.findMany({
      where: { letterId: id },
      orderBy: { versionNumber: 'desc' },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

export const createLetterVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const { changeSummary } = req.body;

    // Verify letter belongs to firm
    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    if (!letter.content) {
      throw createError('Cannot create version of letter with no content', 400);
    }

    // Get the highest version number
    const latestVersion = await prisma.letterVersion.findFirst({
      where: { letterId: id },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create new version
    const version = await prisma.letterVersion.create({
      data: {
        letterId: id,
        versionNumber: newVersionNumber,
        content: letter.content,
        createdById: userId,
        changeSummary: changeSummary || null,
      },
      include: {
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({ version });
  } catch (error) {
    next(error);
  }
};

export const restoreLetterVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, versionId } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    // Verify letter belongs to firm
    const letter = await prisma.demandLetter.findFirst({
      where: { id, firmId },
    });

    if (!letter) {
      throw createError('Letter not found', 404);
    }

    if (letter.status === 'Finalized') {
      throw createError('Cannot restore version of finalized letter', 400);
    }

    // Get the version to restore
    const version = await prisma.letterVersion.findFirst({
      where: {
        id: versionId,
        letterId: id,
      },
    });

    if (!version) {
      throw createError('Version not found', 404);
    }

    // Create a snapshot of current content before restoring
    const latestVersion = await prisma.letterVersion.findFirst({
      where: { letterId: id },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    if (letter.content) {
      await prisma.letterVersion.create({
        data: {
          letterId: id,
          versionNumber: newVersionNumber,
          content: letter.content,
          createdById: userId,
          changeSummary: `Snapshot before restoring to version ${version.versionNumber}`,
        },
      });
    }

    // Restore the version
    const updatedLetter = await prisma.demandLetter.update({
      where: { id },
      data: {
        content: version.content,
      },
    });

    res.json({
      letter: updatedLetter,
      restoredVersion: version.versionNumber,
    });
  } catch (error) {
    next(error);
  }
};
