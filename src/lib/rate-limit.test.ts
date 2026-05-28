import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, resetRateLimitStoreForTests } from "./rate-limit";

test("checkRateLimit allows requests up to the configured limit", () => {
  resetRateLimitStoreForTests();

  const first = checkRateLimit("chat:user-1", { limit: 2, windowMs: 10_000 }, 1_000);
  const second = checkRateLimit("chat:user-1", { limit: 2, windowMs: 10_000 }, 1_500);

  assert.equal(first.success, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.success, true);
  assert.equal(second.remaining, 0);
});

test("checkRateLimit blocks requests over the limit", () => {
  resetRateLimitStoreForTests();

  checkRateLimit("ai:user-1", { limit: 1, windowMs: 10_000 }, 1_000);
  const blocked = checkRateLimit("ai:user-1", { limit: 1, windowMs: 10_000 }, 1_050);

  assert.equal(blocked.success, false);
  assert.equal(blocked.remaining, 0);
});

test("checkRateLimit resets after the window", () => {
  resetRateLimitStoreForTests();

  checkRateLimit("register:ip", { limit: 1, windowMs: 10_000 }, 1_000);
  const afterWindow = checkRateLimit("register:ip", { limit: 1, windowMs: 10_000 }, 11_500);

  assert.equal(afterWindow.success, true);
  assert.equal(afterWindow.remaining, 0);
});
