import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests until the limit is reached", () => {
    const limiter = createRateLimiter({
      limit: 2,
      windowMs: 60_000,
    });

    expect(limiter({ key: "ip-1" })).toBe(true);
    expect(limiter({ key: "ip-1" })).toBe(true);
    expect(limiter({ key: "ip-1" })).toBe(false);
  });

  it("uses separate buckets per key", () => {
    const limiter = createRateLimiter({
      limit: 1,
      windowMs: 60_000,
    });

    expect(limiter({ key: "ip-a" })).toBe(true);
    expect(limiter({ key: "ip-b" })).toBe(true);
  });
});
