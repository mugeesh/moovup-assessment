export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Leaky Bucket Rate Limiter API",
    version: "1.0.0",
    description: "A single global in-memory leaky bucket rate limiter with per-user buckets."
  },
  paths: {
    "/requests": {
      post: {
        summary: "Check whether a request is allowed",
        description: "Fills the user's bucket by one unit and returns whether the request is allowed.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RequestInput" }
            }
          }
        },
        responses: {
          "200": {
            description: "Request allowed",
            headers: {
              "X-RateLimit-Limit": { $ref: "#/components/headers/XRateLimitLimit" },
              "X-RateLimit-Remaining": { $ref: "#/components/headers/XRateLimitRemaining" }
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RequestResult" }
              }
            }
          },
          "429": {
            description: "Request rejected (bucket overflow)",
            headers: {
              "X-RateLimit-Limit": { $ref: "#/components/headers/XRateLimitLimit" },
              "X-RateLimit-Remaining": { $ref: "#/components/headers/XRateLimitRemaining" },
              "Retry-After": {
                description: "Whole seconds until the bucket has leaked room for this request.",
                schema: { type: "integer", minimum: 0 }
              }
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RequestResult" }
              }
            }
          },
          "400": {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    },
    "/buckets/{userId}": {
      get: {
        summary: "Get bucket state for a user",
        description:
          "Returns the bucket as it stands at the time of the call, with elapsed leaking applied.",
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          "200": {
            description: "Current bucket state",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BucketResult" }
              }
            }
          },
          "404": {
            description: "User has never made a request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" }
              }
            }
          }
        }
      }
    }
  },
  components: {
    headers: {
      XRateLimitLimit: {
        description: "Bucket capacity.",
        schema: { type: "integer" }
      },
      XRateLimitRemaining: {
        description: "Whole units of room left in the bucket after this request.",
        schema: { type: "integer", minimum: 0 }
      }
    },
    schemas: {
      RequestInput: {
        type: "object",
        required: ["user_id"],
        properties: {
          user_id: { type: "string", examples: ["user1"] },
          timestamp: {
            type: "number",
            description: "Unix epoch seconds; defaults to server time when omitted.",
            examples: [0]
          }
        }
      },
      Bucket: {
        type: "object",
        properties: {
          level: { type: "number" },
          lastTimestamp: { type: "number", description: "Unix epoch seconds." }
        }
      },
      RequestResult: {
        type: "object",
        properties: {
          allowed: { type: "boolean" },
          user_id: { type: "string" },
          bucket: { $ref: "#/components/schemas/Bucket" }
        }
      },
      BucketResult: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          bucket: { $ref: "#/components/schemas/Bucket" }
        }
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" }
        }
      }
    }
  }
} as const;
