/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import templateRoutes from '../routes/template.routes.js';
import { createDefaultSections } from '../utils/templateVariables.js';

// Mock Prisma Client
vi.mock('@prisma/client', () => {
  const mockPrisma: any = {
    template: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    templateVersion: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback: any) => callback(mockPrisma)),
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

// Mock auth middleware
vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'user-123',
      firmId: 'firm-123',
      role: 'Admin',
    };
    next();
  },
  authorize: (..._roles: string[]) => (_req: any, _res: any, next: any) => {
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/templates', templateRoutes);

// Mock error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

describe('Template Controller', () => {
  const mockTemplate = {
    id: 'template-123',
    firmId: 'firm-123',
    templateName: 'Personal Injury Template',
    templateDescription: 'Standard personal injury demand letter',
    templateContent: {
      sections: createDefaultSections(),
      variables: ['client_name', 'defendant_name', 'incident_date'],
    },
    category: 'Personal Injury',
    createdById: 'user-123',
    version: 1,
    isDefault: false,
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/templates', () => {
    it('should return all active templates for the firm', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findMany as any).mockResolvedValue([mockTemplate]);

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.templates).toHaveLength(1);
      expect(response.body.templates[0].templateName).toBe('Personal Injury Template');
    });

    it('should return empty array when no templates exist', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findMany as any).mockResolvedValue([]);

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.templates).toHaveLength(0);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return a specific template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);

      const response = await request(app).get('/api/templates/template-123');

      expect(response.status).toBe(200);
      expect(response.body.template.id).toBe('template-123');
    });

    it('should return 404 when template not found', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(null);

      const response = await request(app).get('/api/templates/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Template not found');
    });
  });

  describe('POST /api/templates', () => {
    it('should create a new template with valid data', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.create as any).mockResolvedValue(mockTemplate);

      const newTemplate = {
        templateName: 'Personal Injury Template',
        templateDescription: 'Standard personal injury demand letter',
        templateContent: {
          sections: createDefaultSections(),
        },
        category: 'Personal Injury',
        isDefault: false,
      };

      const response = await request(app)
        .post('/api/templates')
        .send(newTemplate);

      expect(response.status).toBe(201);
      expect(response.body.template.templateName).toBe('Personal Injury Template');
    });

    it('should reject template without name', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          templateContent: { sections: createDefaultSections() },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject template without content', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          templateName: 'Test Template',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should reject template with invalid structure', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          templateName: 'Test Template',
          templateContent: { sections: [] }, // Empty sections
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid template structure');
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template and create version when content changes', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const updatedContent = {
        sections: [
          ...createDefaultSections(),
          {
            id: 'new-section',
            title: 'New Section',
            content: 'New content',
            order: 7,
          },
        ],
      };

      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);
      (prisma.$transaction as any).mockResolvedValue({
        ...mockTemplate,
        version: 2,
        templateContent: updatedContent,
      });

      const response = await request(app)
        .put('/api/templates/template-123')
        .send({ templateContent: updatedContent });

      expect(response.status).toBe(200);
      expect(response.body.template.version).toBe(2);
    });

    it('should update template without creating version when only metadata changes', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);
      (prisma.$transaction as any).mockResolvedValue({
        ...mockTemplate,
        templateDescription: 'Updated description',
      });

      const response = await request(app)
        .put('/api/templates/template-123')
        .send({ templateDescription: 'Updated description' });

      expect(response.status).toBe(200);
    });

    it('should return 404 when updating nonexistent template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/templates/nonexistent')
        .send({ templateName: 'Updated Name' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should soft delete a template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);
      (prisma.template.update as any).mockResolvedValue({
        ...mockTemplate,
        isActive: false,
      });

      const response = await request(app).delete('/api/templates/template-123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Template deleted successfully');
    });

    it('should return 404 when deleting nonexistent template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(null);

      const response = await request(app).delete('/api/templates/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/templates/:id/duplicate', () => {
    it('should duplicate a template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);
      (prisma.template.create as any).mockResolvedValue({
        ...mockTemplate,
        id: 'template-456',
        templateName: 'Personal Injury Template (Copy)',
        isDefault: false,
      });

      const response = await request(app).post('/api/templates/template-123/duplicate');

      expect(response.status).toBe(201);
      expect(response.body.template.templateName).toContain('(Copy)');
      expect(response.body.template.isDefault).toBe(false);
    });

    it('should return 404 when duplicating nonexistent template', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(null);

      const response = await request(app).post('/api/templates/nonexistent/duplicate');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/templates/:id/default', () => {
    it('should set template as firm default', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      (prisma.template.findFirst as any).mockResolvedValue(mockTemplate);
      (prisma.$transaction as any).mockImplementation(async (operations: any[]) => {
        return operations;
      });
      (prisma.template.findUnique as any).mockResolvedValue({
        ...mockTemplate,
        isDefault: true,
      });

      const response = await request(app).put('/api/templates/template-123/default');

      expect(response.status).toBe(200);
      expect(response.body.template.isDefault).toBe(true);
    });

    it('should return 404 when setting nonexistent template as default', async () => {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      (prisma.template.findFirst as any).mockResolvedValue(null);

      const response = await request(app).put('/api/templates/nonexistent/default');

      expect(response.status).toBe(404);
    });
  });
});
