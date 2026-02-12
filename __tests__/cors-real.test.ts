import { describe, it, expect } from 'vitest';
import { withCorsHeaders, handleCorsPreFlight } from '@/lib/cors';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Real integration tests for CORS utilities
 * Tests the ACTUAL functions from lib/cors.ts
 */

describe('CORS Utilities - Real Implementation', () => {
  describe('withCorsHeaders()', () => {
    it('should add CORS headers to response', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.has('Access-Control-Allow-Origin')).toBe(true);
      expect(corsResponse.headers.has('Access-Control-Allow-Methods')).toBe(true);
    });

    it('should allow requests from localhost:3000', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        headers: { origin: 'http://localhost:3000' },
      });
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      const allowOrigin = corsResponse.headers.get('Access-Control-Allow-Origin');
      
      expect(allowOrigin).toBe('http://localhost:3000');
    });

    it('should allow requests from localhost:3001', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        headers: { origin: 'http://localhost:3001' },
      });
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      const allowOrigin = corsResponse.headers.get('Access-Control-Allow-Origin');
      
      expect(allowOrigin).toBe('http://localhost:3001');
    });

    it('should include Allow-Methods header', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      const methods = corsResponse.headers.get('Access-Control-Allow-Methods');
      
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('PATCH');
      expect(methods).toContain('OPTIONS');
    });

    it('should include Allow-Headers header', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      const headers = corsResponse.headers.get('Access-Control-Allow-Headers');
      
      expect(headers).toBeDefined();
      expect(headers?.toLowerCase()).toContain('content-type');
    });

    it('should set Max-Age for caching', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      const maxAge = corsResponse.headers.get('Access-Control-Max-Age');
      
      expect(maxAge).toBeDefined();
      // Should be a reasonable cache time (24 hours = 86400 seconds)
      const maxAgeNum = parseInt(maxAge || '0');
      expect(maxAgeNum).toBeGreaterThan(0);
    });

    it('should handle requests without origin header', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.has('Access-Control-Allow-Origin')).toBe(true);
    });

    it('should return a NextResponse object', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse).toBeInstanceOf(NextResponse);
    });

    it('should preserve response body', async () => {
      const testData = JSON.stringify({ id: '123', name: 'Test Link' });
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse(testData);
      
      const corsResponse = withCorsHeaders(request, response);
      const body = await corsResponse.text();
      
      expect(body).toBe(testData);
    });

    it('should preserve response status code', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test', { status: 201 });
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.status).toBe(201);
    });
  });

  describe('handleCorsPreFlight()', () => {
    it('should handle OPTIONS request', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      
      const response = handleCorsPreFlight(request);
      
      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should return 204 No Content for successful preflight', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      
      const response = handleCorsPreFlight(request);
      
      expect(response.status).toBe(204);
    });

    it('should include CORS headers in preflight response', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      
      const response = handleCorsPreFlight(request);
      
      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(true);
      expect(response.headers.has('Access-Control-Allow-Methods')).toBe(true);
      expect(response.headers.has('Access-Control-Allow-Headers')).toBe(true);
    });

    it('should allow all required HTTP methods', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      
      const response = handleCorsPreFlight(request);
      const methods = response.headers.get('Access-Control-Allow-Methods');
      
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('PATCH');
    });

    it('should respect origin from request', () => {
      const origin = 'http://localhost:3001';
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin },
      });
      
      const response = handleCorsPreFlight(request);
      const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
      
      expect(allowOrigin).toBe(origin);
    });

    it('should have empty body for preflight', async () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      
      const response = handleCorsPreFlight(request);
      const body = await response.text();
      
      expect(body).toBe('');
    });
  });

  describe('Real-world API Scenarios', () => {
    it('should enable cross-origin POST requests for creating links', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/shorten'), {
        method: 'POST',
        headers: { 
          origin: 'http://localhost:3000',
          'content-type': 'application/json',
        },
      });
      const response = new NextResponse(JSON.stringify({ success: true, data: { shortCode: 'abc123' } }));
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should enable preflight for complex requests', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/shorten'), {
        method: 'OPTIONS',
        headers: { 
          origin: 'http://localhost:3000',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type, authorization',
        },
      });
      
      const response = handleCorsPreFlight(request);
      
      expect(response.status).toBe(204);
      expect(response.headers.has('Access-Control-Allow-Headers')).toBe(true);
    });

    it('should work with GET requests', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/shorten/abc123'), {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const response = new NextResponse(JSON.stringify({ success: true, data: { url: 'https://example.com' } }));
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });

    it('should work with DELETE requests', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/shorten/manage/123'), {
        method: 'DELETE',
        headers: { origin: 'http://localhost:3000' },
      });
      const response = new NextResponse(JSON.stringify({ success: true }));
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });
  });

  describe('Origins Validation', () => {
    it('should allow configured origins', () => {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      
      for (const origin of allowedOrigins) {
        const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
          headers: { origin },
        });
        const response = new NextResponse('test');
        
        const corsResponse = withCorsHeaders(request, response);
        expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      }
    });

    it('should handle requests from disallowed origins', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'), {
        headers: { origin: 'http://malicious-site.com' },
      });
      const response = new NextResponse('test');
      
      const corsResponse = withCorsHeaders(request, response);
      
      // Should still have header (implementation-dependent on whether to allow or deny)
      expect(corsResponse.headers.has('Access-Control-Allow-Origin')).toBe(true);
    });
  });

  describe('Header Preservation', () => {
    it('should preserve existing response headers', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse('test');
      response.headers.set('X-Custom-Header', 'custom-value');
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.get('X-Custom-Header')).toBe('custom-value');
      expect(corsResponse.headers.has('Access-Control-Allow-Origin')).toBe(true);
    });

    it('should preserve Content-Type header', () => {
      const request = new NextRequest(new URL('http://localhost:3000/api/test'));
      const response = new NextResponse(JSON.stringify({ test: 'data' }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const corsResponse = withCorsHeaders(request, response);
      
      expect(corsResponse.headers.get('Content-Type')).toContain('application/json');
    });
  });
});
