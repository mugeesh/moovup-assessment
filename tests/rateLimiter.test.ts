import {describe, it, expect} from "@jest/globals";
import {
    create_rate_limiter,
    allow_request,
    get_bucket_state
} from "../src/rateLimiter.js";

describe("leaky bucket rate limiter", () => {
    it("allows requests within capacity", () => {
        let limiter = create_rate_limiter(5, 1.0);
        let allowed1: boolean;
        let allowed2: boolean;

        [allowed1, limiter] = allow_request(limiter, "user1", 0);
        [allowed2, limiter] = allow_request(limiter, "user1", 1);

        expect(allowed1).toBe(true);
        expect(allowed2).toBe(true);
        expect(get_bucket_state(limiter, "user1")?.level).toBe(1);
    });

    it("rejects a burst that overflows the bucket", () => {
        let limiter = create_rate_limiter(3, 1.0);
        const results: boolean[] = [];

        for (let i = 0; i < 5; i++) {
            let allowed: boolean;
            [allowed, limiter] = allow_request(limiter, "burst", 0);
            results.push(allowed);
        }

        expect(results).toEqual([true, true, true, false, false]);
        expect(get_bucket_state(limiter, "burst")?.level).toBe(3);
    });

    it("allows requests again after the bucket leaks over time", () => {
        let limiter = create_rate_limiter(2, 1.0);

        [, limiter] = allow_request(limiter, "u", 0);
        [, limiter] = allow_request(limiter, "u", 0);

        let rejected: boolean;
        [rejected, limiter] = allow_request(limiter, "u", 0);
        expect(rejected).toBe(false);

        let allowed: boolean;
        [allowed, limiter] = allow_request(limiter, "u", 2);
        expect(allowed).toBe(true);
    });

    it("keeps per-user buckets independent", () => {
        let limiter = create_rate_limiter(1, 1.0);

        let a1: boolean;
        let b1: boolean;
        [a1, limiter] = allow_request(limiter, "test1", 0);
        [b1, limiter] = allow_request(limiter, "test2", 0);

        expect(a1).toBe(true);
        expect(b1).toBe(true);

        let a2: boolean;
        [a2, limiter] = allow_request(limiter, "test1", 0);
        expect(a2).toBe(false);

        expect(get_bucket_state(limiter, "test2")?.level).toBe(1);
    });

    it("allows the first request from a new user", () => {
        const limiter = create_rate_limiter(5, 1.0);
        const [allowed] = allow_request(limiter, "fresh", 100);
        expect(allowed).toBe(true);
    });

    it("returns null for an unknown user", () => {
        const limiter = create_rate_limiter(5, 1.0);
        expect(get_bucket_state(limiter, "ghost")).toBeNull();
    });

    it("does not mutate the input limiter", () => {
        let limiter = create_rate_limiter(5, 1.0);
        allow_request(limiter, "user1", 0);
        expect(get_bucket_state(limiter, "user1")).toBeNull();
    });
});
