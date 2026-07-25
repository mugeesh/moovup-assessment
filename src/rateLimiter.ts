export interface Bucket {
  readonly level: number;
  readonly lastTimestamp: number;
}

export interface RateLimiter {
  readonly capacity: number;
  readonly leakRate: number;
  readonly buckets: Readonly<Record<string, Bucket>>;
}

export function create_rate_limiter(capacity: number, leakRate: number): RateLimiter {
  return { capacity, leakRate, buckets: {} };
}

function leak(bucket: Bucket, leakRate: number, timestamp: number): Bucket {
  const elapsed = Math.max(0, timestamp - bucket.lastTimestamp);
  const level = Math.max(0, bucket.level - elapsed * leakRate);
  return { level, lastTimestamp: timestamp };
}

export function allow_request(
  limiter: RateLimiter,
  userId: string,
  timestamp: number
): [boolean, RateLimiter] {
  const existing = limiter.buckets[userId] ?? { level: 0, lastTimestamp: timestamp };
  const leaked = leak(existing, limiter.leakRate, timestamp);
  const allowed = leaked.level + 1 <= limiter.capacity;

  const bucket: Bucket = allowed ? { ...leaked, level: leaked.level + 1 } : leaked;

  const next: RateLimiter = {
    ...limiter,
    buckets: { ...limiter.buckets, [userId]: bucket }
  };

  return [allowed, next];
}

export function get_bucket_state(limiter: RateLimiter, userId: string): Bucket | null {
  return limiter.buckets[userId] ?? null;
}
