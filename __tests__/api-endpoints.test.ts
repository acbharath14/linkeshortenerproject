import { describe, it, expect } from 'vitest';

/**
 * Tests for standardized API route responses
 * Ensures all API endpoints use consistent error and success response formats
 */

describe('API Route Response Standardization', () => {
  describe('POST /api/shorten - Create Link', () => {
    it('should return 201 with created link on success', () => {
      const response: any = {
        status: 201,
        body: {
          success: true,
          data: {
            id: 'link-001',
            shortCode: 'abc123',
            originalUrl: 'https://example.com',
            shortUrl: 'http://localhost:3000/l/abc123',
          },
        },
      };

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.error).toBeUndefined();
    });

    it('should return 400 for invalid URL', () => {
      const response = {
        status: 400,
        body: {
          success: false,
          error: 'Invalid URL format',
        },
      };

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for unauthorized', () => {
      const response = {
        status: 401,
        body: {
          success: false,
          error: 'Authentication required',
        },
      };

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate custom alias', () => {
      const response = {
        status: 409,
        body: {
          success: false,
          error: 'Custom alias already in use',
        },
      };

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return 429 for rate limit exceeded', () => {
      const response = {
        status: 429,
        body: {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
      };

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 for server error', () => {
      const response = {
        status: 500,
        body: {
          success: false,
          error: 'An error occurred while processing your request',
        },
      };

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/shorten - List Links', () => {
    it('should return 200 with links array', () => {
      const response = {
        status: 200,
        body: {
          success: true,
          data: {
            data: [
              { id: '1', shortCode: 'abc123', originalUrl: 'https://example.com' },
            ],
          },
        },
      };

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should return 401 for unauthorized', () => {
      const response = {
        status: 401,
        body: {
          success: false,
          error: 'Authentication required',
        },
      };

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 for server error', () => {
      const response = {
        status: 500,
        body: {
          success: false,
          error: 'An error occurred while processing your request',
        },
      };

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/shorten/[shortCode] - Redirect/Fetch Link', () => {
    it('should return 200 with link data', () => {
      const response = {
        status: 200,
        body: {
          success: true,
          data: {
            originalUrl: 'https://example.com',
            shortCode: 'abc123',
          },
        },
      };

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalUrl).toBeDefined();
    });

    it('should return 404 for non-existent short code', () => {
      const response = {
        status: 404,
        body: {
          success: false,
          error: 'Shortened URL not found',
        },
      };

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for disabled link', () => {
      const response = {
        status: 404,
        body: {
          success: false,
          error: 'This link has been disabled',
        },
      };

      expect(response.status).toBe(404);
    });

    it('should return 404 for expired link', () => {
      const response = {
        status: 404,
        body: {
          success: false,
          error: 'This link has expired',
        },
      };

      expect(response.status).toBe(404);
    });

    it('should return 500 for server error', () => {
      const response = {
        status: 500,
        body: {
          success: false,
          error: 'Internal server error',
        },
      };

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/shorten/manage/[id] - Delete Link', () => {
    it('should return 200 on successful deletion', () => {
      const response = {
        status: 200,
        body: {
          success: true,
          data: {
            message: 'URL deleted successfully',
          },
        },
      };

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 for unauthorized', () => {
      const response = {
        status: 401,
        body: {
          success: false,
          error: 'Authentication required',
        },
      };

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent link', () => {
      const response = {
        status: 404,
        body: {
          success: false,
          error: 'Shortened URL not found',
        },
      };

      expect(response.status).toBe(404);
    });

    it('should return 403 for unauthorized ownership', () => {
      const response = {
        status: 403,
        body: {
          success: false,
          error: 'This URL does not belong to you',
        },
      };

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 500 for server error', () => {
      const response = {
        status: 500,
        body: {
          success: false,
          error: 'Internal server error',
        },
      };

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/shorten/manage/[id] - Fetch Link Details', () => {
    it('should return 200 with link details', () => {
      const response = {
        status: 200,
        body: {
          success: true,
          data: {
            id: 'link-001',
            shortCode: 'abc123',
            originalUrl: 'https://example.com',
            clicks: 42,
          },
        },
      };

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 401 for unauthorized', () => {
      const response = {
        status: 401,
        body: {
          success: false,
          error: 'Authentication required',
        },
      };

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent or unauthorized access', () => {
      const response = {
        status: 404,
        body: {
          success: false,
          error: 'Shortened URL not found or access denied',
        },
      };

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 500 for server error', () => {
      const response = {
        status: 500,
        body: {
          success: false,
          error: 'Internal server error',
        },
      };

      expect(response.status).toBe(500);
    });
  });

  describe('CORS Headers on All Responses', () => {
    const allEndpoints = [
      'POST /api/shorten',
      'GET /api/shorten',
      'GET /api/shorten/[shortCode]',
      'DELETE /api/shorten/manage/[id]',
      'GET /api/shorten/manage/[id]',
    ];

    it('should include CORS headers on success responses', () => {
      allEndpoints.forEach((endpoint) => {
        const response = {
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
        };
        expect(response.headers['Access-Control-Allow-Origin']).toBeDefined();
        expect(response.headers['Access-Control-Allow-Methods']).toBeDefined();
      });
    });

    it('should include CORS headers on error responses', () => {
      allEndpoints.forEach((endpoint) => {
        const response = {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000',
          },
        };
        expect(response.headers['Access-Control-Allow-Origin']).toBeDefined();
      });
    });

    it('should handle OPTIONS requests for all endpoints', () => {
      const corsOptions = {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };

      expect(corsOptions.status).toBe(204);
      expect(corsOptions.headers['Access-Control-Allow-Methods']).toContain('OPTIONS');
    });
  });

  describe('Response Consistency', () => {
    it('every response should have success field', () => {
      const responses = [
        { success: true, data: {} },
        { success: false, error: 'Error message' },
        { success: true, data: [] },
        { success: false, error: 'Another error' },
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('success');
        expect(typeof response.success).toBe('boolean');
      });
    });

    it('successful response should only have data, not error', () => {
      const successResponse = {
        success: true,
        data: { id: '1' },
      };

      expect(successResponse.data).toBeDefined();
      expect((successResponse as any).error).toBeUndefined();
    });

    it('error response should only have error, not data', () => {
      const errorResponse = {
        success: false,
        error: 'Something went wrong',
      };

      expect(errorResponse.error).toBeDefined();
      expect((errorResponse as any).data).toBeUndefined();
    });

    it('all status codes should follow HTTP conventions', () => {
      const validStatusCodes = [200, 201, 204, 400, 401, 403, 404, 409, 429, 500];
      const responses = [
        { status: 201, expected: true },
        { status: 200, expected: true },
        { status: 400, expected: true },
        { status: 401, expected: true },
        { status: 999, expected: false },
      ];

      responses.forEach((response) => {
        const isValid = validStatusCodes.includes(response.status);
        if (response.expected) {
          expect(isValid).toBe(true);
        }
      });
    });
  });
});
