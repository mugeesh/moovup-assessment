import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import { createServer } from "../src/server.js";

describe("REST API", () => {
  it("allows a request and reflects bucket state", async () => {
    const app = createServer(5, 1.0);

    const res = await request(app).post("/requests").send({ user_id: "api-user", timestamp: 0 });

    expect(res.status).toBe(200);
    expect(res.body.allowed).toBe(true);
    expect(res.body.bucket.level).toBe(1);
  });

  it("rejects with 429 once the bucket overflows", async () => {
    const app = createServer(1, 1.0);

    await request(app).post("/requests").send({ user_id: "over", timestamp: 0 });
    const res = await request(app).post("/requests").send({ user_id: "over", timestamp: 0 });

    expect(res.status).toBe(429);
    expect(res.body.allowed).toBe(false);
  });

  it("rejects a non-numeric timestamp with 400", async () => {
    const app = createServer(5, 1.0);
    const res = await request(app).post("/requests").send({ user_id: "bad", timestamp: "not-a-number" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown bucket", async () => {
    const app = createServer(5, 1.0);
    const res = await request(app).get("/buckets/nobody");
    expect(res.status).toBe(404);
  });

  it("advertises the limit and remaining budget on every decision", async () => {
    const app = createServer(5, 1.0);

    const res = await request(app).post("/requests").send({ user_id: "headers", timestamp: 0 });

    expect(res.headers["x-ratelimit-limit"]).toBe("5");
    expect(res.headers["x-ratelimit-remaining"]).toBe("4");
    expect(res.headers["retry-after"]).toBeUndefined();
  });

  it("sends Retry-After when it rejects a request", async () => {
    const app = createServer(2, 0.5);

    await request(app).post("/requests").send({ user_id: "slow", timestamp: 0 });
    await request(app).post("/requests").send({ user_id: "slow", timestamp: 0 });
    const res = await request(app).post("/requests").send({ user_id: "slow", timestamp: 0 });

    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBe("2");
    expect(res.headers["x-ratelimit-remaining"]).toBe("0");
  });

  it("reports a bucket that has drained since the last request", async () => {
    const app = createServer(5, 1.0);

    await request(app).post("/requests").send({ user_id: "drained", timestamp: 0 });
    const res = await request(app).get("/buckets/drained");

    expect(res.status).toBe(200);
    expect(res.body.bucket.level).toBe(0);
  });
});
