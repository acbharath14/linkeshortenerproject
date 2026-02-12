/**
 * Rate Limiter with support for Upstash Redis and in-memory fallback
 * 
 * For development: Uses in-memory storage
 * For production: Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * 
 * If Upstash env vars are missing, falls back to in-memory rate limiting.
 * For distributed production systems, Upstash Redis is strongly recommended.
 * 
 * Environment variables:
 * - UPSTASH_REDIS_REST_URL: REST API endpoint
 * - UPSTASH_REDIS_REST_TOKEN: Authentication token
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime?: number;
}

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowSeconds: number;

  constructor(maxRequests: number = 10, windowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(identifier);
    const windowMs = this.windowSeconds * 1000;

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { success: true, remaining: this.maxRequests - 1 };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    return { success: true, remaining: this.maxRequests - entry.count };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

class UpstashRateLimiter {
  private readonly url: string;
  private readonly token: string;
  private readonly maxRequests: number;
  private readonly windowSeconds: number;

  constructor(maxRequests: number = 10, windowSeconds: number = 60) {
    this.url = process.env.UPSTASH_REDIS_REST_URL || "";
    this.token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      const key = `rate_limit:${identifier}`;

      // Use Redis INCR to increment counter
      const response = await fetch(`${this.url}/incr/${key}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Redis error: ${response.statusText}`);
      }

      const data = (await response.json()) as { result: number };
      const count = data.result;

      // Set expiration on first request
      if (count === 1) {
        await fetch(`${this.url}/expire/${key}/${this.windowSeconds}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }).catch(() => {
          // Ignore expiration errors
        });
      }

      if (count > this.maxRequests) {
        return { success: false, remaining: 0 };
      }

      return { success: true, remaining: this.maxRequests - count };
    } catch (error) {
      console.error("Upstash rate limiter error:", error);
      // Fall back to allowing the request on error
      return { success: true, remaining: this.maxRequests };
    }
  }
}

// Determine which rate limiter to use
const useUpstash =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN;

export const rateLimiter = useUpstash
  ? new UpstashRateLimiter(
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10"),
      parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60")
    )
  : new InMemoryRateLimiter(
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10"),
      parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || "60")
    );

// Log which rate limiter is being used
if (typeof window === "undefined") {
  const limiterType = useUpstash ? "Upstash Redis" : "In-Memory";
  console.log(`Rate limiter initialized: ${limiterType}`);
}
