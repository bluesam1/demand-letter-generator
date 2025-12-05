import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Export API', () => {
  let authToken: string;
  let firmId: string;
  let userId: string;
  let letterId: string;

  beforeAll(async () => {
    // Create test firm
    const firm = await prisma.firm.create({
      data: {
        firmName: 'Test Law Firm Export',
        firmAddress: '123 Test St, Test City, TS 12345',
        contactEmail: 'export@testfirm.com',
        contactPhone: '555-0100',
      },
    });
    firmId = firm.id;

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        firmId,
        email: 'export@testfirm.com',
        firstName: 'Export',
        lastName: 'Tester',
        role: 'Attorney',
        passwordHash: hashedPassword,
      },
    });
    userId = user.id;

    // Generate auth token
    authToken = jwt.sign({ userId: user.id, firmId: firm.id, role: user.role }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });

    // Create test letter with content
    const letter = await prisma.demandLetter.create({
      data: {
        firmId,
        createdById: userId,
        clientName: 'John Doe',
        defendantName: 'Jane Smith',
        caseReference: 'CASE-2024-001',
        status: 'Generated',
        content: '<p>This is a test demand letter with <strong>bold text</strong> and regular content.</p>',
      },
    });
    letterId = letter.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.export.deleteMany({ where: { letter: { firmId } } });
    await prisma.demandLetter.deleteMany({ where: { firmId } });
    await prisma.user.deleteMany({ where: { firmId } });
    await prisma.firm.delete({ where: { id: firmId } });
    await prisma.$disconnect();
  });

  describe('POST /api/letters/:id/export', () => {
    it('should export a letter to Word format', async () => {
      const response = await request(app)
        .post(`/api/letters/${letterId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ includeLetterhead: true })
        .expect(201);

      expect(response.body.export).toBeDefined();
      expect(response.body.export.id).toBeDefined();
      expect(response.body.export.fileName).toMatch(/\.docx$/);
      expect(response.body.export.format).toBe('docx');
      expect(response.body.export.fileSize).toBeGreaterThan(0);
    });

    it('should reject export without authentication', async () => {
      await request(app).post(`/api/letters/${letterId}/export`).expect(401);
    });

    it('should reject export for non-existent letter', async () => {
      await request(app)
        .post('/api/letters/00000000-0000-0000-0000-000000000000/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ includeLetterhead: true })
        .expect(404);
    });
  });

  describe('GET /api/letters/:id/exports', () => {
    it('should get all exports for a letter', async () => {
      const response = await request(app)
        .get(`/api/letters/${letterId}/exports`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.exports).toBeDefined();
      expect(Array.isArray(response.body.exports)).toBe(true);
      expect(response.body.exports.length).toBeGreaterThan(0);
    });

    it('should reject without authentication', async () => {
      await request(app).get(`/api/letters/${letterId}/exports`).expect(401);
    });
  });

  describe('GET /api/exports/:id/download', () => {
    it('should download an export file', async () => {
      // First, create an export
      const createResponse = await request(app)
        .post(`/api/letters/${letterId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ includeLetterhead: true });

      const exportId = createResponse.body.export.id;

      // Then download it
      const response = await request(app)
        .get(`/api/exports/${exportId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(response.body).toBeDefined();
    });

    it('should reject download without authentication', async () => {
      await request(app).get('/api/exports/00000000-0000-0000-0000-000000000000/download').expect(401);
    });
  });

  describe('DELETE /api/exports/:id', () => {
    it('should delete an export', async () => {
      // First, create an export
      const createResponse = await request(app)
        .post(`/api/letters/${letterId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ includeLetterhead: true });

      const exportId = createResponse.body.export.id;

      // Then delete it
      await request(app)
        .delete(`/api/exports/${exportId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/exports/${exportId}/download`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject delete without authentication', async () => {
      await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000000').expect(401);
    });
  });
});
