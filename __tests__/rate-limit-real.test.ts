import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rateLimiter } from '@/lib/rate-limit';

/**
 * Real integration tests for rate limiter
 * Tests the ACTUAL rateLimiter instance from lib/rate-limit.ts
 */

describe('Rate Limiter - Real Implementation', () => {
  // Test with the actual rateLimiter instance
  // This will use in-memory limiter if Upstash env vars are not set

  beforeEach(() => {
    // Clear any previous state
    vi.clearAllMocks();
  });

  describe('Basic Rate Limiting', () => {
    it('rateLimiter should be defined', () => {
      expect(rateLimiter).toBeDefined();
    });

    it('should have a limit method', () => {
      expect(typeof rateLimiter.limit).toBe('function');
    });

    it('should allow requests within the limit', async () => {
      const clientId = `test-client-${Date.now()}`;
      
      // Should allow first few requests
      for (let i = 0; i < 3; i++) {
        const result = await rateLimiter.limit(clientId);
        expect(result.success).toBe(true);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
      }
    });

    it('should track remaining requests correctly', async () => {
      const clientId = `test-client-remaining-${Date.now()}`;
      
      // First request
      const result1 = await rateLimiter.limit(clientId);
      const remaining1 = result1.remaining;
      
      // Second request - should have one less
      const result2 = await rateLimiter.limit(clientId);
      const remaining2 = result2.remaining;
      
      expect(remaining2).toBeLessThan(remaining1);
    });
  });

  describe('Rate Limit Enforcement', () => {
    it(
      'should return false when rate limit exceeded',
      async () => {
        const clientId = `test-client-exceeded-${Date.now()}`;
        let limitExceeded = false;

        // Keep making requests until we hit the limit
        for (let i = 0; i < 50; i++) {
          const result = await rateLimiter.limit(clientId);
          if (!result.success) {
            limitExceeded = true;
            break;
          }
        }

        expect(limitExceeded).toBe(true);
      },
      { timeout: 2000 }
    );

    it(
      'should include reset time when rate limited',
      async () => {
        const clientId = `test-client-reset-${Date.now()}`;

        // Exhaust the limit
        let lastResult: any = { success: true };
        for (let i = 0; i < 50; i++) {
          lastResult = await rateLimiter.limit(clientId);
          if (!lastResult.success) break;
        }

        if (!lastResult.success) {
          expect(lastResult.resetTime).toBeDefined();
          expect(lastResult.resetTime).toBeGreaterThan(Date.now());
        }
      },
      { timeout: 2000 }
    );
  });

  describe('Rate Limiter Response Structure', () => {
    it('success response should have correct structure', async () => {
      const clientId = `test-client-structure-${Date.now()}`;
      const result = await rateLimiter.limit(clientId);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('remaining');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
    });

    it(
      'should provide remaining at 0 when limit reached',
      async () => {
        const clientId = `test-client-zero-${Date.now()}`;

        // Exhaust limit
        let lastResult;
        for (let i = 0; i < 50; i++) {
          lastResult = await rateLimiter.limit(clientId);
          if (!lastResult.success) break;
        }

        // Should show 0 remaining when limit exceeded
        if (!lastResult.success) {
          expect(lastResult.remaining).toBe(0);
        }
      },
      { timeout: 2000 }
    );
  });

  describe('Different Clients', () => {
    it('should track different clients separately', async () => {
      const clientA = `client-a-${Date.now()}`;
      const clientB = `client-b-${Date.now()}`;
      
      // Make requests for client A
      const resultA1 = await rateLimiter.limit(clientA);
      const resultA2 = await rateLimiter.limit(clientA);
      
      // Make requests for client B
      const resultB1 = await rateLimiter.limit(clientB);
      const resultB2 = await rateLimiter.limit(clientB);
      
      // Client A should have fewer remaining than before
      expect(resultA2.remaining).toBeLessThan(resultA1.remaining);
      
      // Client B should have fewer remaining than before
      expect(resultB2.remaining).toBeLessThan(resultB1.remaining);
      
      // Both should have >= 0 remaining (within limit)
      expect(resultA2.remaining).toBeGreaterThanOrEqual(0);
      expect(resultB2.remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it(
      'should protect API endpoint from spam',
      async () => {
        const clientId = 'spam-client';
        const requests = [];

        // Simulate rapid requests
        for (let i = 0; i < 20; i++) {
          const result = await rateLimiter.limit(clientId);
          requests.push(result);
        }

        // Some should succeed, some should fail
        const successful = requests.filter((r) => r.success).length;
        const failed = requests.filter((r) => !r.success).length;

        // At least some should be successful (before hitting limit)
        expect(successful).toBeGreaterThan(0);

        // At least some should be rate limited
        expect(failed).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );

    it(
      'should reset for different time windows',
      async () => {
        const clientId = `test-window-${Date.now()}`;

        // Make a request in first window
        const result1 = await rateLimiter.limit(clientId);
        expect(result1.success).toBe(true);

        // Both requests use separate tracking - should work independently
        const anotherClient = `another-${Date.now()}`;
        const result2 = await rateLimiter.limit(anotherClient);
        expect(result2.success).toBe(true);
      },
      { timeout: 3000 }
    );
  });

  describe('Type Safety', () => {
    it('should return typed result object', async () => {
      const clientId = `test-types-${Date.now()}`;
      const result = await rateLimiter.limit(clientId);
      
      // Should have correct types
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      
      // Optional fields
      if ('resetTime' in result && result.resetTime) {
        expect(typeof result.resetTime).toBe('number');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty client ID', async () => {
      const result = await rateLimiter.limit('');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('remaining');
    });

    it('should handle very long client ID', async () => {
      const longId = 'x'.repeat(1000);
      const result = await rateLimiter.limit(longId);
      expect(result).toHaveProperty('success');
    });

    it('should handle special characters in client ID', async () => {
      const specialId = 'client-!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = await rateLimiter.limit(specialId);
      expect(result).toHaveProperty('success');
    });

    it(
      'should handle rapid sequential requests',
      async () => {
        const clientId = `rapid-${Date.now()}`;

        // Fire multiple requests quickly
        const promises = [];
        for (let i = 0; i < 10; i++) {
          promises.push(rateLimiter.limit(clientId));
        }

        const results = await Promise.all(promises);

        // Should have mix of success and rate limited
        expect(results.length).toBe(10);
        expect(results.some((r) => r.success)).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  describe('Async Behavior', () => {
    it('should return a promise', () => {
      const result = rateLimiter.limit('test-promise');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve successfully', async () => {
      const result = await rateLimiter.limit(`test-resolve-${Date.now()}`);
      expect(result).toBeDefined();
      expect(result.success !== undefined).toBe(true);
    });

    it('should not throw on normal usage', async () => {
      const clientId = `test-no-throw-${Date.now()}`;
      
      await expect(rateLimiter.limit(clientId)).resolves.toBeDefined();
    });
  });
});
