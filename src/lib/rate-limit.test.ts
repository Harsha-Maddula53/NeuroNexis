import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, RateLimitClient } from "./rate-limit";

function createMockClient(): RateLimitClient {
  const store = new Map<string, number>();
  return {
    incr: async (key: string) => {
      const val = (store.get(key) || 0) + 1;
      store.set(key, val);
      return val;
    },
    pexpire: async () => 1,
  };
}

test("checkRateLimit allows requests up to the configured limit", async () => {
  const mockClient = createMockClient();

  const first = await checkRateLimit("chat:user-1", { limit: 2, windowMs: 10_000 }, 1_000, mockClient);
  const second = await checkRateLimit("chat:user-1", { limit: 2, windowMs: 10_000 }, 1_500, mockClient);

  assert.equal(first.success, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.success, true);
  assert.equal(second.remaining, 0);
});

test("checkRateLimit blocks requests over the limit", async () => {
  const mockClient = createMockClient();

  await checkRateLimit("ai:user-1", { limit: 1, windowMs: 10_000 }, 1_000, mockClient);
  const blocked = await checkRateLimit("ai:user-1", { limit: 1, windowMs: 10_000 }, 1_050, mockClient);

  assert.equal(blocked.success, false);
  assert.equal(blocked.remaining, 0);
});

