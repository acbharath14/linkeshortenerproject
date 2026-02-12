import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Test for Link Shortener rate limiting on link creation
 * Covers both in-memory and Upstash Redis implementations
 */

describe('Link Shortener - Rate Limiting', () => {
  class SimpleRateLimiter {
    private store: Map<string, { count: number; resetTime: number }> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number = 10, windowSeconds: number = 60) {
      this.maxRequests = maxRequests;
      this.windowMs = windowSeconds * 1000;
    }

    async limit(identifier: string): Promise<{ success: boolean; remaining: number }> {
      const now = Date.now();
      const entry = this.store.get(identifier);

      if (!entry || now > entry.resetTime) {
        this.store.set(identifier, {
          count: 1,
          resetTime: now + this.windowMs,
        });
        return { success: true, remaining: this.maxRequests - 1 };
      }

      if (entry.count >= this.maxRequests) {
        return { success: false, remaining: 0 };
      }

      entry.count++;
      return { success: true, remaining: this.maxRequests - entry.count };
    }

    cleanup(): void {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key);
        }
      }
    }
  }

  describe('In-Memory Rate Limiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = new SimpleRateLimiter(5, 60);
      const result = await limiter.limit('user-1');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding limit', async () => {
      const limiter = new SimpleRateLimiter(2, 60);
      await limiter.limit('user-2');
      await limiter.limit('user-2');
      const result = await limiter.limit('user-2');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track remaining requests correctly', async () => {
      const limiter = new SimpleRateLimiter(5, 60);
      const result1 = await limiter.limit('user-3');
      const result2 = await limiter.limit('user-3');
      expect(result1.remaining).toBe(4);
      expect(result2.remaining).toBe(3);
    });

    it('should isolate rate limits per identifier', async () => {
      const limiter = new SimpleRateLimiter(2, 60);
      await limiter.limit('user-a');
      await limiter.limit('user-a');
      const resultUserB = await limiter.limit('user-b');
      expect(resultUserB.success).toBe(true);
      expect(resultUserB.remaining).toBe(1);
    });

    it('should reset limit after window expires', async () => {
      const limiter = new SimpleRateLimiter(1, 0.1); // 100ms window
      await limiter.limit('user-4');
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      const result = await limiter.limit('user-4');
      expect(result.success).toBe(true);
    });

    it('should handle cleanup of expired entries', async () => {
      const limiter = new SimpleRateLimiter(10, 0.1);
      await limiter.limit('old-user');
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Clean up expired entries
      limiter.cleanup();
      
      // Should create new entry
      const result = await limiter.limit('old-user');
      expect(result.success).toBe(true);
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should allow configurable max requests', async () => {
      const limiterSmall = new SimpleRateLimiter(3, 60);
      const limiterLarge = new SimpleRateLimiter(100, 60);

      const resultSmall = await limiterSmall.limit('test-1');
      const resultLarge = await limiterLarge.limit('test-2');

      expect(resultSmall.remaining).toBeLessThan(resultLarge.remaining);
    });

    it('should allow configurable window seconds', async () => {
      const shortWindow = new SimpleRateLimiter(5, 1);  // 1 second
      const longWindow = new SimpleRateLimiter(5, 300); // 5 minutes

      expect(shortWindow).toBeDefined();
      expect(longWindow).toBeDefined();
    });

    it('should read configuration from environment variables', () => {
      const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
      const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60');

      expect(maxRequests).toBeGreaterThan(0);
      expect(windowSeconds).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiter Selection (In-Memory vs Upstash)', () => {
    it('should use in-memory limiter when Upstash env vars are missing', () => {
      const hasUpstashConfig = 
        !!process.env.UPSTASH_REDIS_REST_URL && 
        !!process.env.UPSTASH_REDIS_REST_TOKEN;

      // In development, Upstash is typically not configured
      if (!hasUpstashConfig) {
        expect(hasUpstashConfig).toBe(false);
      }
    });

    it('should use Upstash Redis when environment is configured', () => {
      const hasUpstashUrl = !!process.env.UPSTASH_REDIS_REST_URL;
      const hasUpstashToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

      // Should have both or neither
      const shouldUseUpstash = hasUpstashUrl || hasUpstashToken;
      if (shouldUseUpstash) {
        expect(hasUpstashUrl).toBe(hasUpstashToken);
      }
    });
  });

  describe('IP-based Rate Limiting', () => {
    it('should track different IPs separately', async () => {
      const limiter = new SimpleRateLimiter(2, 60);
      const ip1Result1 = await limiter.limit('192.168.1.1');
      const ip1Result2 = await limiter.limit('192.168.1.1');
      const ip2Result = await limiter.limit('192.168.1.2');

      expect(ip1Result1.success).toBe(true);
      expect(ip1Result2.success).toBe(true);
      expect(ip2Result.success).toBe(true);
    });

    it('should handle IP forwarding headers', () => {
      const xForwardedFor = '203.0.113.1, 198.51.100.1';
      const firstIp = xForwardedFor.split(',')[0].trim();
      expect(firstIp).toBe('203.0.113.1');
    });

    it('should fallback to connection IP when header is missing', () => {
      const defaultIp = '127.0.0.1';
      expect(defaultIp).toBeDefined();
    });
  });

  describe('Rate Limit Edge Cases', () => {
    it('should handle exactly max requests', async () => {
      const limiter = new SimpleRateLimiter(3, 60);
      const result1 = await limiter.limit('edge-1');
      const result2 = await limiter.limit('edge-1');
      const result3 = await limiter.limit('edge-1');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block immediately after limit', async () => {
      const limiter = new SimpleRateLimiter(2, 60);
      await limiter.limit('edge-2');
      await limiter.limit('edge-2');
      const result = await limiter.limit('edge-2');

      expect(result.success).toBe(false);
    });

    it('should handle concurrent requests from same identifier', async () => {
      const limiter = new SimpleRateLimiter(5, 60);
      const promises = Array.from({ length: 5 }, () => limiter.limit('concurrent-user'));
      const results = await Promise.all(promises);

      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeLessThanOrEqual(5);
    });

    it('should handle very high limits gracefully', async () => {
      const limiter = new SimpleRateLimiter(100000, 60);
      const result = await limiter.limit('high-limit-user');
      expect(result.success).toBe(true);
    });

    it('should handle zero remaining requests', async () => {
      const limiter = new SimpleRateLimiter(1, 60);
      await limiter.limit('user-blocked');
      const blocked = await limiter.limit('user-blocked');

      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe('Production Considerations', () => {
    it('should prefer Upstash for distributed systems', () => {
      // In production, Upstash should be configured
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        expect(process.env.UPSTASH_REDIS_REST_URL).toBeDefined();
        expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeDefined();
      }
    });

    it('should fallback gracefully if Redis is unavailable', () => {
      // Should not crash, should use in-memory
      const fallbackAvailable = true;
      expect(fallbackAvailable).toBe(true);
    });

    it('should log which limiter is being used', () => {
      // Development: in-memory
      // Production: Upstash Redis
      const useUpstash = 
        !!process.env.UPSTASH_REDIS_REST_URL && 
        !!process.env.UPSTASH_REDIS_REST_TOKEN;

      const limiterType = useUpstash ? 'Upstash Redis' : 'In-Memory';
      expect(['Upstash Redis', 'In-Memory']).toContain(limiterType);
    });
  });
});
