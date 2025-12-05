import { describe, it, expect, vi } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

describe('Response Utilities', () => {
  it('should format success response correctly', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const testData = { id: '123', name: 'Test' };
    successResponse(mockRes as never, testData);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: testData,
        meta: expect.objectContaining({
          timestamp: expect.any(String),
          version: '1.0',
        }),
      })
    );
  });

  it('should format error response correctly', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorResponse(mockRes as never, 'TEST_ERROR', 'Test error message', 400);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'TEST_ERROR',
          message: 'Test error message',
        }),
        meta: expect.objectContaining({
          timestamp: expect.any(String),
          version: '1.0',
        }),
      })
    );
  });

  it('should format paginated response correctly', () => {
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const testData = [{ id: '1' }, { id: '2' }];
    paginatedResponse(mockRes as never, testData, 1, 20, 100);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: testData,
        pagination: expect.objectContaining({
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
          hasMore: true,
        }),
      })
    );
  });
});
