
The full flow, per backend-4.md

The three functions (backend-4.md:15-28) — this is src/rateLimiter.ts:

create_rate_limiter(capacity, leak_rate)   // makes the limiter: { capacity, leakRate, buckets:{} }
allow_request(limiter, user_id, timestamp) // returns [allowed, new_limiter]


Every request stayed at timestamp:0, so the clock never moved and the bucket never drained. Working exactly as designed.

See it recover — advance the clock

# 3 virtual seconds later: 3 × 1.0 = 3 units leak out (5 → 2), then +1 = 3, allowed
curl -X POST localhost:3000/requests -H 'Content-Type: application/json' \
-d '{"user_id":"user1","timestamp":3}'
# → allowed:true, level:3

# fully drained after 5+ seconds
curl -X POST localhost:3000/requests -H 'Content-Type: application/json' \
-d '{"user_id":"user1","timestamp":10}'
# → allowed:true, level:1

Or use a fresh user to see a clean start:
curl -X POST localhost:3000/requests -H 'Content-Type: application/json' \
-d '{"user_id":"alice","timestamp":0}'
# → allowed:true, level:1

Or restart the server (Ctrl+C, npm start) — state is in-memory, so it wipes clean.

The mental model: timestamp is a clock you hold. Sending the same number twice = "no time passed." To let the bucket leak, each request's timestamp must move
forward. Real-world clients don't pass a timestamp at all — they use the wall clock, which always moves forward on its own.

✻ Baked for 30s

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ commit this
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
⏵⏵ auto mode on (shift+tab to cycle) · ← 1 agent                                                                                             ⧉ In MANUAL_TEST.md
-d '{"user_id":"user1","timestamp":10}'
# → allowed:true, level:1

Or use a fresh user to see a clean start:
curl -X POST localhost:3000/requests -H 'Content-Type: application/json' \
-d '{"user_id":"alice","timestamp":0}'
# → allowed:true, level:1

Or restart the server (Ctrl+C, npm start) — state is in-memory, so it wipes clean.

The mental model: timestamp is a clock you hold. Sending the same number twice = "no time passed." To let the bucket leak, each request's timestamp must move
forward. Real-world clients don't pass a timestamp at all — they use the wall clock, which always moves forward on its own.

✻ Baked for 30s

───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
❯ commit this
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
⏵⏵ auto mode on (shift+tab to cycle) · ← 1 agent                                                                                                    ⧉ In dsds.md

