import { describe, it, expect, afterAll } from 'vitest';

// Set JWT_SECRET before importing the module
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';

import { generateTokenPair, verifyAccessToken, verifyRefreshToken } from '../../utils/jwtUtils';

describe('JWT Utilities', () => {
  afterAll(() => {
    // Clean up environment variables
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateTokenPair(
        'user-123',
        'firm-456',
        'test@example.com',
        'Admin'
      );

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should include correct payload in access token', () => {
      const tokens = generateTokenPair(
        'user-123',
        'firm-456',
        'test@example.com',
        'Admin'
      );

      const decoded = verifyAccessToken(tokens.accessToken);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.firmId).toBe('firm-456');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('Admin');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const tokens = generateTokenPair(
        'user-123',
        'firm-456',
        'test@example.com',
        'Attorney'
      );

      const decoded = verifyAccessToken(tokens.accessToken);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.role).toBe('Attorney');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const tokens = generateTokenPair(
        'user-123',
        'firm-456',
        'test@example.com',
        'Paralegal'
      );

      const decoded = verifyRefreshToken(tokens.refreshToken);
      expect(decoded.sub).toBe('user-123');
      expect(decoded.role).toBe('Paralegal');
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
