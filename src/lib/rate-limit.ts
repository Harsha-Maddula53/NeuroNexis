import { Redis } from '@upstash/redis';
import * as Sentry from '@sentry/nextjs';

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
};

export interface RateLimitClient {
  incr(key: string): Promise<number>;
  pexpire(key: string, ms: number): Promise<any>;
}

// Initialize Redis if credentials exist
export const defaultRedisClient = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return "unknown";
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  nowMs = Date.now(),
  client: RateLimitClient | null = defaultRedisClient
): Promise<RateLimitResult> {
  const resetAtMs = nowMs + config.windowMs;

  if (!client) {
    // If Redis is not configured, fail open locally to not block development/tests.
    console.warn('[RateLimit] Redis not configured, failing OPEN locally.');
    return {
      success: true,
      limit: config.limit,
      remaining: 0,
      resetAtMs,
    };
  }

  try {
    const prefix = process.env.RATE_LIMIT_PREFIX || 'ratelimit:';
    const redisKey = `${prefix}${key}`;
    // Atomic increment
    const currentCount = await client.incr(redisKey);
    
    // If it was the first hit, set expiry
    if (currentCount === 1) {
      await client.pexpire(redisKey, config.windowMs);
    }

    const success = currentCount <= config.limit;
    
    return {
      success,
      limit: config.limit,
      remaining: Math.max(0, config.limit - currentCount),
      // We estimate the reset time since we don't fetch TTL strictly for performance,
      // assuming it will reset at nowMs + windowMs for the first hit
      resetAtMs,
    };
  } catch (error) {
    // Fail-closed approach on Redis error.
    console.error('[RateLimit] Redis connection or command failed:', error);
    
    // Alert via Sentry to make it a paged incident instead of a silent failure
    Sentry.captureException(error, {
      tags: { component: 'rate-limit' },
      extra: { key, limit: config.limit }
    });

    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAtMs,
    };
  }
}

export function buildRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAtMs / 1000)),
  };
}
