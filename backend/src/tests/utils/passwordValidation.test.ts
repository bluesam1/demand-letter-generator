import { describe, it, expect } from 'vitest';
import { validatePassword, isStrongPassword } from '../../utils/passwordValidation';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const result = validatePassword('MyPassword123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password less than 12 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 12 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('mypassword123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('MyPassword!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('MyPassword123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should return multiple errors for weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('isStrongPassword', () => {
    it('should return true for strong password', () => {
      expect(isStrongPassword('MyPassword123!')).toBe(true);
    });

    it('should return false for weak password', () => {
      expect(isStrongPassword('weak')).toBe(false);
    });
  });
});
