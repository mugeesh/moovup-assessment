import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction
} from "express";
import swaggerUi from "swagger-ui-express";
import {
  create_rate_limiter,
  allow_request,
  get_bucket_state,
  retry_after_seconds,
  type RateLimiter
} from "./rateLimiter.js";
import { openapiSpec } from "./openapi.js";

function nowSeconds(): number {
  return Date.now() / 1000;
}

function parseTimestamp(value: unknown): number | null {
  if (value === undefined) {
    return nowSeconds();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
}

export function createServer(capacity: number, leakRate: number): Express {
  let limiter: RateLimiter = create_rate_limiter(capacity, leakRate);

  const app = express();
  app.use(express.json());

  app.get("/openapi.json", (_req, res) => res.json(openapiSpec));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));


  app.post("/requests", (req, res) => {
    const userId = req.body?.user_id;
    if (typeof userId !== "string" || userId.length === 0) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const timestamp = parseTimestamp(req.body?.timestamp);
    if (timestamp === null) {
      return res.status(400).json({ error: "timestamp must be a number (Unix epoch seconds)" });
    }

    const [allowed, next] = allow_request(limiter, userId, timestamp);
    limiter = next;

    const bucket = get_bucket_state(limiter, userId)!;
    res.set("X-RateLimit-Limit", String(capacity));
    res.set("X-RateLimit-Remaining", String(Math.max(0, Math.floor(capacity - bucket.level))));

    if (!allowed) {
      res.set("Retry-After", String(Math.ceil(retry_after_seconds(limiter, userId, timestamp))));
    }

    return res.status(allowed ? 200 : 429).json({ allowed, user_id: userId, bucket });
  });

  app.get("/buckets/:userId", (req, res) => {
    const raw = req.query.timestamp;
    let timestamp = nowSeconds();

    if (raw !== undefined) {
      const parsed = typeof raw === "string" ? Number(raw) : Number.NaN;
      if (raw === "" || !Number.isFinite(parsed)) {
        return res.status(400).json({ error: "timestamp must be a number (Unix epoch seconds)" });
      }
      timestamp = parsed;
    }

    const bucket = get_bucket_state(limiter, req.params.userId, timestamp);
    if (bucket === null) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ user_id: req.params.userId, bucket });
  });

  app.use((_req, res) => res.status(404).json({ error: "not found" }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ error: "invalid JSON body" });
    }
    return res.status(500).json({ error: "internal server error" });
  });

  return app;
}
