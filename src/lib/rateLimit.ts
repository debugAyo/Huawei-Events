type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function createRateLimiter(options: RateLimitOptions) {
  const { limit, windowMs } = options;

  return function checkLimit({ key }: { key: string }) {
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
      const nextEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + windowMs,
      };
      buckets.set(key, nextEntry);
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count += 1;
    return true;
  };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
