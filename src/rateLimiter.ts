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
  if (!Number.isFinite(capacity) || capacity <= 0) {
    throw new RangeError(`capacity must be a finite number greater than 0 (received ${capacity})`);
  }
  if (!Number.isFinite(leakRate) || leakRate <= 0) {
    throw new RangeError(`leakRate must be a finite number greater than 0 (received ${leakRate})`);
  }
  return { capacity, leakRate, buckets: {} };
}

function leak(bucket: Bucket, leakRate: number, timestamp: number): Bucket {
  const elapsed = Math.max(0, timestamp - bucket.lastTimestamp);
  return {
    level: Math.max(0, bucket.level - elapsed * leakRate),
    lastTimestamp: Math.max(bucket.lastTimestamp, timestamp)
  };
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

export function get_bucket_state(
  limiter: RateLimiter,
  userId: string,
  timestamp?: number
): Bucket | null {
  const bucket = limiter.buckets[userId];
  if (bucket === undefined) {
    return null;
  }
  return timestamp === undefined ? bucket : leak(bucket, limiter.leakRate, timestamp);
}

export function retry_after_seconds(
  limiter: RateLimiter,
  userId: string,
  timestamp: number
): number {
  const bucket = get_bucket_state(limiter, userId, timestamp);
  if (bucket === null) {
    return 0;
  }
  const overflow = bucket.level + 1 - limiter.capacity;
  return overflow <= 0 ? 0 : overflow / limiter.leakRate;
}