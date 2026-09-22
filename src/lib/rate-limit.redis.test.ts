import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, defaultRedisClient } from "./rate-limit";

test("Redis rate limiter functionality", async (t) => {
  if (!defaultRedisClient) {
    t.skip("Upstash Redis not configured, skipping integration test");
    return;
  }

  const key = `redis-test:${Math.random()}`;
  const first = await checkRateLimit(key, { limit: 2, windowMs: 10_000 }, Date.now());
  assert.equal(first.success, true, "First request should succeed");

  const second = await checkRateLimit(key, { limit: 2, windowMs: 10_000 }, Date.now());
  assert.equal(second.success, true, "Second request should succeed");

  const third = await checkRateLimit(key, { limit: 2, windowMs: 10_000 }, Date.now());
  assert.equal(third.success, false, "Third request should fail");
});

