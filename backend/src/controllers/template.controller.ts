import { Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { createError } from '../middleware/errorHandler.js';
import { extractVariables, validateTemplateStructure, TemplateContent } from '../utils/templateVariables.js';

const prisma = new PrismaClient();

export const getAllTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const templates = await prisma.template.findMany({
      where: { firmId, isActive: true },
      orderBy: { templateName: 'asc' },
      select: {
        id: true,
        templateName: true,
        templateDescription: true,
        category: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ templates });
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const template = await prisma.template.findFirst({
      where: { id, firmId },
    });

    if (!template) {
      throw createError('Template not found', 404);
    }

    res.json({ template });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const { templateName, templateDescription, templateContent, category, isDefault } = req.body;

    if (!templateName || !templateContent) {
      throw createError('Template name and content are required', 400);
    }

    // Validate template structure
    const structureValidation = validateTemplateStructure(templateContent);
    if (!structureValidation.valid) {
      throw createError(`Invalid template structure: ${structureValidation.errors.join(', ')}`, 400);
    }

    // Extract variables from content
    const variables = extractVariables(templateContent as TemplateContent);

    const template = await prisma.template.create({
      data: {
        firmId,
        createdById: userId,
        templateName,
        templateDescription: templateDescription || null,
        templateContent: {
          ...templateContent,
          variables,
        },
        category: category || null,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const existingTemplate = await prisma.template.findFirst({
      where: { id, firmId },
    });

    if (!existingTemplate) {
      throw createError('Template not found', 404);
    }

    const { templateName, templateDescription, templateContent, category, isDefault } = req.body;

    // If content is being updated, create a version snapshot
    const shouldCreateVersion = templateContent &&
      JSON.stringify(templateContent) !== JSON.stringify(existingTemplate.templateContent);

    const updateData: Prisma.TemplateUpdateInput = {
      ...(templateName && { templateName }),
      ...(templateDescription !== undefined && { templateDescription }),
      ...(templateContent && { templateContent }),
      ...(category !== undefined && { category }),
      ...(isDefault !== undefined && { isDefault }),
    };

    if (shouldCreateVersion) {
      updateData.version = existingTemplate.version + 1;
    }

    // Use transaction to update template and create version snapshot
    const result = await prisma.$transaction(async (tx) => {
      // Create version snapshot if content changed
      if (shouldCreateVersion) {
        await tx.templateVersion.create({
          data: {
            templateId: id,
            version: existingTemplate.version,
            content: existingTemplate.templateContent as Prisma.InputJsonValue,
            createdById: userId,
          },
        });
      }

      // Update the template
      const template = await tx.template.update({
        where: { id },
        data: updateData,
      });

      return template;
    });

    res.json({ template: result });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const existingTemplate = await prisma.template.findFirst({
      where: { id, firmId },
    });

    if (!existingTemplate) {
      throw createError('Template not found', 404);
    }

    // Soft delete
    await prisma.template.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const duplicateTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;
    const userId = req.user?.userId;

    if (!firmId || !userId) {
      throw createError('Unauthorized', 401);
    }

    const existingTemplate = await prisma.template.findFirst({
      where: { id, firmId },
    });

    if (!existingTemplate) {
      throw createError('Template not found', 404);
    }

    // Create a copy with a new name
    const copyName = `${existingTemplate.templateName} (Copy)`;

    const template = await prisma.template.create({
      data: {
        firmId,
        createdById: userId,
        templateName: copyName,
        templateDescription: existingTemplate.templateDescription,
        templateContent: existingTemplate.templateContent as Prisma.InputJsonValue,
        category: existingTemplate.category,
        isDefault: false,
      },
    });

    res.status(201).json({ template });
  } catch (error) {
    next(error);
  }
};

export const setDefaultTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const firmId = req.user?.firmId;

    if (!firmId) {
      throw createError('Unauthorized', 401);
    }

    const existingTemplate = await prisma.template.findFirst({
      where: { id, firmId },
    });

    if (!existingTemplate) {
      throw createError('Template not found', 404);
    }

    // Use a transaction to clear all other defaults and set this one
    await prisma.$transaction([
      prisma.template.updateMany({
        where: { firmId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.template.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    const updatedTemplate = await prisma.template.findUnique({
      where: { id },
    });

    res.json({ template: updatedTemplate });
  } catch (error) {
    next(error);
  }
};
