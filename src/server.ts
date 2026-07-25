import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import {
  create_rate_limiter,
  allow_request,
  get_bucket_state,
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

    return res.status(allowed ? 200 : 429).json({
      allowed,
      user_id: userId,
      bucket: get_bucket_state(limiter, userId)
    });
  });

  app.get("/buckets/:userId", (req, res) => {
    const bucket = get_bucket_state(limiter, req.params.userId);
    if (bucket === null) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ user_id: req.params.userId, bucket });
  });

  return app;
}
