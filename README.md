# Leaky Bucket Rate Limiter

A small REST API backed by a single global in-memory leaky bucket rate limiter,
with an immutable functional core and per-user buckets.

## Requirements

- Node.js 18+ (developed on Node 24)

## Install

```bash
npm install
```

## Run

```bash
npm start
```

The server listens on `http://localhost:3000` by default.

Configuration via environment variables (defaults shown):

| Variable    | Default | Meaning                 |
| ----------- | ------- | ----------------------- |
| `CAPACITY`  | `5`     | Maximum bucket size     |
| `LEAK_RATE` | `1.0`   | Units leaked per second |
| `PORT`      | `3000`  | HTTP port               |

```bash
CAPACITY=5 LEAK_RATE=1.0 PORT=3000 npm start
```

## Run tests

```bash
npm test
```

## API

Interactive docs (Swagger UI, OpenAPI 3.1) are served at:

```
http://localhost:3000/docs
```

The raw spec is available at `http://localhost:3000/openapi.json`.

### `POST /requests` — check whether a request is allowed

```bash
curl -X POST http://localhost:3000/requests \
  -H 'content-type: application/json' \
  -d '{"user_id":"user1"}'
```

Body:

- `user_id` (string, required)
- `timestamp` (number, optional) — Unix epoch seconds; defaults to server time.
  Mainly useful for deterministic testing of leaking/burst behavior.

Returns `200` with `allowed: true` when accepted, or `429` with `allowed: false`
when the request would overflow the bucket.

```json
{ "allowed": true, "user_id": "user1", "bucket": { "level": 1, "lastTimestamp": 0 } }
```

### `GET /buckets/:userId` — get bucket state for a user

```bash
curl http://localhost:3000/buckets/user1
```

Returns `200` with the bucket state, or `404` if the user has never made a request.

## Core interface

Defined in `src/rateLimiter.ts`:

- `create_rate_limiter(capacity, leakRate)` — creates a new limiter.
- `allow_request(limiter, userId, timestamp)` — returns `[allowed, newLimiter]`.
- `get_bucket_state(limiter, userId)` — returns the bucket info, or `null`.

## Design decisions and trade-offs

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

## Project layout

```
src/rateLimiter.ts   core functional limiter (the three required functions)
src/server.ts        Express app wiring the core to REST endpoints
src/openapi.ts       OpenAPI 3.1 spec served via Swagger UI
src/config.ts        env-based configuration with defaults
src/index.ts         startup: creates the global limiter and listens
tests/               unit tests for the core and basic API tests
```
