# Leaky Bucket Rate Limiter

A small REST API with one global in-memory leaky bucket limiter. Every user gets
their own bucket, and the core logic is written as pure functions.

## Requirements

Node.js 18 or newer. Developed on Node 24.

## Run locally

```bash
npm install
npm start
```

The server runs on `http://localhost:3000`. If you'd rather use Docker, skip
straight to the section below, it doesn't need any of this.

Config comes from environment variables:

| Variable    | Default | Meaning                 |
|-------------|---------|-------------------------|
| `CAPACITY`  | `5`     | Maximum bucket size     |
| `LEAK_RATE` | `1.0`   | Units leaked per second |
| `PORT`      | `3000`  | HTTP port               |

```bash
CAPACITY=5 LEAK_RATE=1.0 PORT=3000 npm start
```

<<<<<<< HEAD
## Run tests
=======
If you pass something that isn't a positive number, it throws at startup rather
than starting up broken.

## Tests

These run on the host, so they need `npm install` even if you're using Docker.
>>>>>>> c9315af (test: simplify the replay helper in property tests)

```bash
npm test
```

<<<<<<< HEAD
=======
There's also a typecheck script that covers `src` and `tests` (the build config
only includes `src`):

```bash
npm run typecheck
```

## Run with Docker

```bash
docker compose up --build
```

That's all you need, the image installs its own dependencies. The same
environment variables work:

```bash
CAPACITY=10 LEAK_RATE=2 docker compose up --build
```

The Dockerfile builds in two stages, so the final image only carries `dist/` and
production dependencies. It runs as the `node` user rather than root.

>>>>>>> c9315af (test: simplify the replay helper in property tests)
## API

Swagger UI is at `http://localhost:3000/docs`, and the raw OpenAPI spec at
`http://localhost:3000/openapi.json`.

### POST /requests

```bash
curl -X POST http://localhost:3000/requests \
  -H 'content-type: application/json' \
  -d '{"user_id":"user1"}'
```

Body takes `user_id` (string, required) and `timestamp` (number, optional). The
timestamp is Unix epoch seconds and defaults to server time. It's mostly there so
tests can drive leaking and burst behaviour deterministically.

You get `200` with `allowed: true`, or `429` with `allowed: false` if the request
would overflow the bucket.

```json
{ "allowed": true, "user_id": "user1", "bucket": { "level": 1, "lastTimestamp": 0 } }
```

<<<<<<< HEAD
### `GET /buckets/:userId` — get bucket state for a user
=======
Both responses carry `X-RateLimit-Limit` and `X-RateLimit-Remaining`. A `429` also
carries `Retry-After` with the whole seconds until there's room again, so the
client doesn't have to poll and guess.

### GET /buckets/:userId
>>>>>>> c9315af (test: simplify the replay helper in property tests)

```bash
curl http://localhost:3000/buckets/user1
```

Returns `200` with the bucket state, or `404` if that user has never made a request.

## Core functions

All in `src/rateLimiter.ts`:

<<<<<<< HEAD
- `create_rate_limiter(capacity, leakRate)` — creates a new limiter.
- `allow_request(limiter, userId, timestamp)` — returns `[allowed, newLimiter]`.
- `get_bucket_state(limiter, userId)` — returns the bucket info, or `null`.
=======
- `create_rate_limiter(capacity, leakRate)` throws if either value isn't a
  positive finite number
- `allow_request(limiter, userId, timestamp)` returns `[allowed, newLimiter]`
- `get_bucket_state(limiter, userId, timestamp?)` returns bucket info, or `null`
- `retry_after_seconds(limiter, userId, timestamp)` returns how long until one
  more request would fit
>>>>>>> c9315af (test: simplify the replay helper in property tests)

I added the last one so the Express handler doesn't have to do limiter arithmetic
itself.

<<<<<<< HEAD
- **Immutable functional core.** `allow_request` never mutates its input; it
  returns a new limiter with a fresh `buckets` map. The single point of mutation
  is a `let limiter` variable in the Express layer, which reassigns to the
  returned state after each request. This keeps the algorithm pure and easy to
  test while satisfying the "single global limiter" requirement.
- **Leaking model.** Each bucket stores a `level` and the `lastTimestamp` it was
  updated. On each request the elapsed time since `lastTimestamp` is multiplied
  by `leakRate` and subtracted (floored at 0) before deciding whether adding one
  unit would exceed `capacity`. Rejected requests still advance the timestamp and
  apply leaking but do not add a unit.
- **New users.** A first-time user starts from an empty bucket anchored at the
  request timestamp, so the first request is always allowed when `capacity >= 1`.
- **`get_bucket_state` is a pure read.** It returns the stored state as last
  written by `allow_request` and does not itself apply leaking, keeping it a
  side-effect-free debugging view.
- **In-memory, single-threaded.** State lives in a plain object per the
  constraints — no database, Redis, or locking.
=======
## Notes on the design

`allow_request` doesn't mutate anything, it returns a new limiter, and the caller
swaps it in. The only mutable thing in the app is a single `let limiter` in
`server.ts`.

Each bucket holds a level and the time it was last touched. A request subtracts
`elapsed * leakRate` (floored at zero) then checks whether one more unit fits.
Rejected requests still leak, they just don't add anything. `lastTimestamp` only
moves forward, using `max(stored, incoming)`, otherwise a late or skewed timestamp
would drag the anchor back and make later requests over-leak.

`get_bucket_state` never changes anything. Pass it a timestamp and you get a copy
with leaking applied, which is what `GET /buckets/:userId` uses so the level isn't
stale.

Config is checked on boot because a `NaN` capacity makes `level + 1 <= NaN` false
every time, quietly rejecting every request forever with nothing in the logs.
>>>>>>> c9315af (test: simplify the replay helper in property tests)

State is a plain object, no database or locks, since Node's event loop keeps one
handler's read and write from interleaving with another's. For production I'd
evict drained buckets, which are indistinguishable from unseen users. Right now
memory grows with the number of distinct user ids.

## Testing

The unit tests cover the scenarios from the brief. On top of those,
`tests/rateLimiter.property.test.ts` uses fast-check to generate random request
sequences and assert things that should always hold: the level stays between 0 and
capacity, the limiter is never mutated, replaying the same events gives the same
result, one user's traffic doesn't affect another's, and no user gets more than
`capacity + leakRate * elapsed` requests through.

The out-of-order timestamp case has its own ordinary test. It causes over-leaking
rather than breaking any of those bounds, so the property tests wouldn't catch it.

## Layout

```
<<<<<<< HEAD
src/rateLimiter.ts   core functional limiter (the three required functions)
src/server.ts        Express app wiring the core to REST endpoints
src/openapi.ts       OpenAPI 3.1 spec served via Swagger UI
src/config.ts        env-based configuration with defaults
src/index.ts         startup: creates the global limiter and listens
tests/               unit tests for the core and basic API tests
=======
src/rateLimiter.ts                  the core functions
src/server.ts                       Express app
src/openapi.ts                      OpenAPI spec for Swagger UI
src/config.ts                       env config with validation
src/index.ts                        startup
tests/rateLimiter.test.ts           core unit tests
tests/rateLimiter.property.test.ts  property tests
tests/server.test.ts                API tests
>>>>>>> c9315af (test: simplify the replay helper in property tests)
```
