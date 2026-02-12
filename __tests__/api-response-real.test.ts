import { describe, it, expect } from 'vitest';
import { 
  apiSuccess, 
  apiBadRequest, 
  apiUnauthorized, 
  apiForbidden, 
  apiNotFound, 
  apiConflict, 
  apiTooManyRequests, 
  apiInternalError 
} from '@/lib/api-response';
import { NextResponse } from 'next/server';

/**
 * Real integration tests for API response utilities
 * Tests the ACTUAL functions from lib/api-response.ts
 */

describe('API Response Utilities - Real Implementation', () => {
  describe('apiSuccess()', () => {
    it('should create a NextResponse with success=true', () => {
      const data = { id: 'link-001', shortCode: 'abc123' };
      const response = apiSuccess(data);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should use custom status code', () => {
      const data = { id: 'link-001' };
      const response = apiSuccess(data, 201);

      expect(response.status).toBe(201);
    });

    it('should serialize data to JSON', async () => {
      const data = { id: 'link-001', shortCode: 'abc123' };
      const response = apiSuccess(data);
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
      expect(body.error).toBeUndefined();
    });
  });

  describe('apiBadRequest()', () => {
    it('should return 400 status code', () => {
      const response = apiBadRequest('Invalid URL');

      expect(response.status).toBe(400);
    });

    it('should include error message', async () => {
      const response = apiBadRequest('Invalid URL format');
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid URL format');
    });

    it('should include error code when provided', async () => {
      const response = apiBadRequest('Invalid URL', 'INVALID_URL');
      const body = await response.json();

      expect(body.code).toBe('INVALID_URL');
    });
  });

  describe('apiUnauthorized()', () => {
    it('should return 401 status code', () => {
      const response = apiUnauthorized();

      expect(response.status).toBe(401);
    });

    it('should have error message', async () => {
      const response = apiUnauthorized('User not authenticated');
      const body = await response.json();

      expect(body.success).toBe(false);
      expect(body.error).toBe('User not authenticated');
    });
  });

  describe('apiForbidden()', () => {
    it('should return 403 status code', () => {
      const response = apiForbidden();

      expect(response.status).toBe(403);
    });

    it('should have proper error message', async () => {
      const response = apiForbidden('Access denied');
      const body = await response.json();

      expect(body.error).toBe('Access denied');
    });
  });

  describe('apiNotFound()', () => {
    it('should return 404 status code', () => {
      const response = apiNotFound();

      expect(response.status).toBe(404);
    });

    it('should match standard 404 message', async () => {
      const response = apiNotFound('Link not found');
      const body = await response.json();

      expect(body.error).toBe('Link not found');
    });
  });

  describe('apiConflict()', () => {
    it('should return 409 status code', () => {
      const response = apiConflict();

      expect(response.status).toBe(409);
    });

    it('should indicate conflict reason', async () => {
      const response = apiConflict('Alias already exists');
      const body = await response.json();

      expect(body.error).toBe('Alias already exists');
    });
  });

  describe('apiTooManyRequests()', () => {
    it('should return 429 status code', () => {
      const response = apiTooManyRequests();

      expect(response.status).toBe(429);
    });

    it('should indicate rate limit', async () => {
      const response = apiTooManyRequests('Rate limit exceeded');
      const body = await response.json();

      expect(body.error).toContain('Rate limit');
    });
  });

  describe('apiInternalError()', () => {
    it('should return 500 status code', () => {
      const response = apiInternalError();

      expect(response.status).toBe(500);
    });

    it('should have generic error message (no sensitive data)', async () => {
      const response = apiInternalError();
      const body = await response.json();

      expect(body.error).toBe('Internal server error');
      expect(body.error).not.toContain('password');
      expect(body.error).not.toContain('database');
    });
  });

  describe('Response Structure Consistency', () => {
    it('all success responses should have success=true', async () => {
      const response = apiSuccess({ test: 'data' });
      const body = await response.json();

      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });

    it('all error responses should have success=false', async () => {
      const responses = [
        apiBadRequest(),
        apiUnauthorized(),
        apiForbidden(),
        apiNotFound(),
        apiConflict(),
        apiTooManyRequests(),
        apiInternalError(),
      ];

      for (const response of responses) {
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.error).toBeDefined();
      }
    });

    it('error responses should NEVER include data field', async () => {
      const response = apiBadRequest('Invalid input');
      const body = await response.json();

      expect(body.data).toBeUndefined();
    });

    it('success responses should NEVER include error field', async () => {
      const response = apiSuccess({ id: '1' });
      const body = await response.json();

      expect(body.error).toBeUndefined();
    });
  });

  describe('Content-Type Headers', () => {
    it('response should have application/json content type', () => {
      const response = apiSuccess({ test: 'data' });

      expect(response.headers.get('content-type')).toBe('application/json');
    });

    it('all error responses should have JSON content type', () => {
      const errorResponses = [
        apiBadRequest(),
        apiUnauthorized(),
        apiConflict(),
      ];

      errorResponses.forEach((response) => {
        expect(response.headers.get('content-type')).toBe('application/json');
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle creating a link successfully', async () => {
      const linkData = {
        id: 'link-001',
        shortCode: 'abc123',
        originalUrl: 'https://github.com/acbharath14/linkshortenerproject',
        shortUrl: 'http://localhost:3000/l/abc123',
      };
      const response = apiSuccess(linkData, 201);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.data.shortCode).toBe('abc123');
    });

    it('should handle authorization failure', async () => {
      const response = apiUnauthorized('No authentication token provided');
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('should handle duplicate alias conflict', async () => {
      const response = apiConflict('Custom alias already in use');
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.error).toContain('already in use');
    });

    it('should handle rate limiting', async () => {
      const response = apiTooManyRequests('Too many requests. Please try again later.');
      const body = await response.json();

      expect(response.status).toBe(429);
      expect(body.error).toContain('Too many');
    });
  });
});
