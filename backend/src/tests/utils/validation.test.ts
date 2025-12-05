import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createLetterSchema,
  updateLetterSchema,
  createTemplateSchema,
} from '../../utils/validation.js';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const { error } = loginSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        firmName: 'Test Firm',
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createLetterSchema', () => {
    it('should validate correct letter data', () => {
      const validData = {
        clientName: 'John Client',
        defendantName: 'Jane Defendant',
        caseReference: 'CASE-2025-001',
        demandAmount: 50000.00,
      };

      const { error } = createLetterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        clientName: 'John Client',
      };

      const { error } = createLetterSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('updateLetterSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        status: 'In Review',
      };

      const { error } = updateLetterSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'InvalidStatus',
      };

      const { error } = updateLetterSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('createTemplateSchema', () => {
    it('should validate correct template data', () => {
      const validData = {
        templateName: 'Test Template',
        templateContent: { blocks: [] },
        category: 'Personal Injury',
      };

      const { error } = createTemplateSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        templateName: 'Test Template',
      };

      const { error } = createTemplateSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
