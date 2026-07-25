import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";
import {
  create_rate_limiter,
  allow_request,
  get_bucket_state,
  type RateLimiter
} from "../src/rateLimiter.js";

const capacityArb = fc.integer({ min: 1, max: 20 });
const leakRateArb = fc.double({ min: 0.1, max: 5, noNaN: true, noDefaultInfinity: true });
const userArb = fc.constantFrom("alice", "bob", "carol");

const eventArb = fc.record({
  userId: userArb,
  timestamp: fc.double({ min: 0, max: 1000, noNaN: true, noDefaultInfinity: true })
});
const eventsArb = fc.array(eventArb, { maxLength: 60 });

type Event = { userId: string; timestamp: number };

function replay(limiter: RateLimiter, events: readonly Event[]) {
  let current = limiter;
  let allowed = 0;

  for (const event of events) {
    const [ok, next] = allow_request(current, event.userId, event.timestamp);
    current = next;
    if (ok) allowed++;
  }

  return { limiter: current, allowed };
}

describe("leaky bucket properties", () => {
  it("keeps every bucket level within [0, capacity]", () => {
    fc.assert(
      fc.property(capacityArb, leakRateArb, eventsArb, (capacity, leakRate, events) => {
        const { limiter } = replay(create_rate_limiter(capacity, leakRate), events);

        for (const userId of Object.keys(limiter.buckets)) {
          const bucket = get_bucket_state(limiter, userId)!;
          expect(bucket.level).toBeGreaterThanOrEqual(0);
          expect(bucket.level).toBeLessThanOrEqual(capacity);
        }
      })
    );
  });

  it("never mutates the limiter it is given", () => {
    fc.assert(
      fc.property(capacityArb, leakRateArb, eventsArb, (capacity, leakRate, events) => {
        const limiter = create_rate_limiter(capacity, leakRate);
        const snapshot = JSON.stringify(limiter);

        replay(limiter, events);

        expect(JSON.stringify(limiter)).toBe(snapshot);
      })
    );
  });

  it("is deterministic: replaying the same events yields the same state", () => {
    fc.assert(
      fc.property(capacityArb, leakRateArb, eventsArb, (capacity, leakRate, events) => {
        const first = replay(create_rate_limiter(capacity, leakRate), events);
        const second = replay(create_rate_limiter(capacity, leakRate), events);

        expect(second).toEqual(first);
      })
    );
  });

  it("keeps users independent regardless of interleaving", () => {
    fc.assert(
      fc.property(capacityArb, leakRateArb, eventsArb, userArb, (capacity, leakRate, events, userId) => {
        const interleaved = replay(create_rate_limiter(capacity, leakRate), events).limiter;
        const isolated = replay(
          create_rate_limiter(capacity, leakRate),
          events.filter((event) => event.userId === userId)
        ).limiter;

        expect(get_bucket_state(interleaved, userId)).toEqual(get_bucket_state(isolated, userId));
      })
    );
  });

  it("admits at most capacity + leakRate * elapsed requests per user", () => {
    fc.assert(
      fc.property(
        capacityArb,
        leakRateArb,
        fc.array(fc.double({ min: 0, max: 500, noNaN: true, noDefaultInfinity: true }), {
          maxLength: 60
        }),
        (capacity, leakRate, timestamps) => {
          const sorted = [...timestamps].sort((a, b) => a - b);
          const events = sorted.map((timestamp) => ({ userId: "alice", timestamp }));
          const { allowed } = replay(create_rate_limiter(capacity, leakRate), events);

          const window = sorted.length === 0 ? 0 : sorted[sorted.length - 1]! - sorted[0]!;
          expect(allowed).toBeLessThanOrEqual(capacity + leakRate * window + 1e-9);
        }
      )
    );
  });
});
