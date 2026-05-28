type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAtMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
};

const buckets = new Map<string, Bucket>();
let nextSweepAtMs = 0;

function sweepExpiredBuckets(nowMs: number): void {
  if (nowMs < nextSweepAtMs) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAtMs <= nowMs) {
      buckets.delete(key);
    }
  }

  nextSweepAtMs = nowMs + 60_000;
}

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

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  nowMs = Date.now(),
): RateLimitResult {
  sweepExpiredBuckets(nowMs);

  const existing = buckets.get(key);
  if (!existing || existing.resetAtMs <= nowMs) {
    const resetAtMs = nowMs + config.windowMs;
    buckets.set(key, { count: 1, resetAtMs });

    return {
      success: true,
      limit: config.limit,
      remaining: Math.max(0, config.limit - 1),
      resetAtMs,
    };
  }

  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAtMs: existing.resetAtMs,
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    success: true,
    limit: config.limit,
    remaining: Math.max(0, config.limit - existing.count),
    resetAtMs: existing.resetAtMs,
  };
}

export function buildRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAtMs / 1000)),
  };
}

export function resetRateLimitStoreForTests(): void {
  buckets.clear();
  nextSweepAtMs = 0;
}
