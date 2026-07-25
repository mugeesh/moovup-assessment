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
});
