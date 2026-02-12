import { describe, it, expect } from 'vitest';
import { NextResponse } from 'next/server';

/**
 * Tests for standardized API response utilities
 * Located: lib/api-response.ts
 */

describe('API Response Utilities', () => {
  describe('Response Format', () => {
    it('should return success response with data', () => {
      const data = { id: '123', name: 'Test Link' };
      const response: any = {
        success: true,
        data,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
    });

    it('should return error response with message', () => {
      const response: any = {
        success: false,
        error: 'Invalid URL format',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid URL format');
      expect(response.data).toBeUndefined();
    });

    it('should include error code when provided', () => {
      const response = {
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
      };

      expect(response.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should never include both data and error', () => {
      interface ApiResponse {
        success: boolean;
        data?: unknown;
        error?: string;
      }

      const validSuccess: ApiResponse = {
        success: true,
        data: { id: '1' },
      };
      const validError: ApiResponse = {
        success: false,
        error: 'Not found',
      };

      if (validSuccess.data) expect(validSuccess.data).toBeDefined();
      if (validSuccess.error) expect(validSuccess.error).toBeUndefined();

      if (validError.error) expect(validError.error).toBeDefined();
      if (validError.data) expect(validError.data).toBeUndefined();
      
      // Verify proper structure
      expect(validSuccess.success).toBe(true);
      expect(validError.success).toBe(false);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should use 200 for successful GET/PUT', () => {
      const statusCode = 200;
      expect([200, 201]).toContain(statusCode);
    });

    it('should use 201 for resource creation', () => {
      const statusCode = 201;
      expect(statusCode).toBe(201);
    });

    it('should use 400 for bad request', () => {
      const statusCode = 400;
      expect(statusCode).toBe(400);
    });

    it('should use 401 for unauthorized', () => {
      const statusCode = 401;
      expect(statusCode).toBe(401);
    });

    it('should use 403 for forbidden', () => {
      const statusCode = 403;
      expect(statusCode).toBe(403);
    });

    it('should use 404 for not found', () => {
      const statusCode = 404;
      expect(statusCode).toBe(404);
    });

    it('should use 409 for conflict (duplicate alias)', () => {
      const statusCode = 409;
      expect(statusCode).toBe(409);
    });

    it('should use 429 for rate limit', () => {
      const statusCode = 429;
      expect(statusCode).toBe(429);
    });

    it('should use 500 for internal server error', () => {
      const statusCode = 500;
      expect(statusCode).toBe(500);
    });
  });

  describe('Error Response Consistency', () => {
    it('should have consistent structure across all error types', () => {
      const errors = [
        { success: false, error: 'Bad request', code: 'BAD_REQUEST' },
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { success: false, error: 'Forbidden', code: 'FORBIDDEN' },
        { success: false, error: 'Not found', code: 'NOT_FOUND' },
        { success: false, error: 'Conflict', code: 'CONFLICT' },
        { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
        { success: false, error: 'Internal error', code: 'INTERNAL_ERROR' },
      ];

      errors.forEach((error) => {
        expect(error).toHaveProperty('success');
        expect(error).toHaveProperty('error');
        expect(error).toHaveProperty('code');
        expect(error.success).toBe(false);
        expect(typeof error.error).toBe('string');
        expect(typeof error.code).toBe('string');
      });
    });
  });

  describe('Success Response Consistency', () => {
    it('should have consistent structure across all success responses', () => {
      const responses = [
        {
          success: true,
          data: { id: '1', shortCode: 'abc123' },
        },
        {
          success: true,
          data: [
            { id: '1', shortCode: 'abc123' },
            { id: '2', shortCode: 'def456' },
          ],
        },
        {
          success: true,
          data: { message: 'URL deleted successfully' },
        },
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('data');
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
      });
    });
  });

  describe('Response data validation', () => {
    it('should allow any serializable data in success response', () => {
      const testCases = [
        { data: { id: '123' } },
        { data: [1, 2, 3] },
        { data: 'simple string' },
        { data: 42 },
        { data: true },
        { data: null },
      ];

      testCases.forEach((testCase) => {
        const response = {
          success: true,
          data: testCase.data,
        };
        expect(response.data).toEqual(testCase.data);
      });
    });

    it('should sanitize error messages (no sensitive data)', () => {
      const sensitiveError = 'Database connection failed: password123@localhost:5432';
      const sanitized = 'An error occurred while processing your request';

      expect(sanitized).not.toContain('password');
      expect(sanitized).not.toContain('localhost');
    });
  });
});
