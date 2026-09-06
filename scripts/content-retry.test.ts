import { describe, expect, test } from "bun:test";

// Importing helpers does not run the guarded content-generation entrypoint.
const {
  getRetryAfterMs,
  withRetry,
  RateLimiter,
} = require("./generate-blog-content.js");

describe("Notion content sync rate limits", () => {
  test("reads Retry-After from the SDK's real Headers shape", () => {
    expect(
      getRetryAfterMs({ headers: new Headers({ "Retry-After": "12" }) }),
    ).toBe(12000);
    expect(getRetryAfterMs({ headers: { "retry-after": "3" } })).toBe(3000);
    expect(getRetryAfterMs({ headers: { "Retry-After": "2" } })).toBe(2000);
    expect(
      getRetryAfterMs({
        headers: new Headers({ "retry-after": "12" }),
        body: { retry_after: 1 },
      }),
    ).toBe(12000);
  });

  test("accepts JSON-string and object body hints, ignoring empty or malformed hints", () => {
    expect(
      getRetryAfterMs({
        body: JSON.stringify({ additional_data: { retry_after: "12" } }),
      }),
    ).toBe(12000);
    expect(getRetryAfterMs({ body: { retry_after: 2 } })).toBe(2000);
    expect(
      getRetryAfterMs({
        body: "not JSON",
        headers: new Headers({ "retry-after": "" }),
      }),
    ).toBeUndefined();
    expect(getRetryAfterMs({})).toBeUndefined();
  });

  test("does not truncate the server's 12-second wait to the old 8-second cap", async () => {
    let calls = 0;
    const delays: number[] = [];
    const result = await withRetry(
      async () => {
        calls++;
        if (calls === 1)
          throw { status: 429, headers: new Headers({ "retry-after": "12" }) };
        return "synced";
      },
      {
        wait: async (ms: number) => {
          delays.push(ms);
        },
      },
    );
    expect(result).toBe("synced");
    expect(calls).toBe(2);
    expect(delays).toEqual([12000]);
  });

  test("keeps retries bounded and never retries permission failures", async () => {
    const failure = {
      status: 429,
      headers: new Headers({ "retry-after": "12" }),
    };
    let calls = 0;
    const delays: number[] = [];
    await expect(
      withRetry(
        async () => {
          calls++;
          throw failure;
        },
        {
          attempts: 2,
          wait: async (ms: number) => {
            delays.push(ms);
          },
        },
      ),
    ).rejects.toBe(failure);
    expect(calls).toBe(2);
    expect(delays).toEqual([12000]);
    const denied = { status: 401 };
    await expect(
      withRetry(
        async () => {
          throw denied;
        },
        {
          wait: async () => {
            throw new Error("must not wait");
          },
        },
      ),
    ).rejects.toBe(denied);
  });

  test("a new worker cannot bypass the queue's cooldown", async () => {
    const events: string[] = [];
    let release: () => void = () => {};
    const limiter = new RateLimiter(400, async () => {
      events.push("cooldown");
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    });
    await limiter.execute(async () => {
      events.push("first");
    });
    const second = limiter.execute(async () => {
      events.push("second");
    });
    await Promise.resolve();
    expect(events).toEqual(["first", "cooldown"]);
    release();
    await second;
    expect(events.slice(0, 3)).toEqual(["first", "cooldown", "second"]);
    release();
  });

  test("a failed operation does not poison the shared queue", async () => {
    const delays: number[] = [];
    const limiter = new RateLimiter(400, async (ms: number) => {
      delays.push(ms);
    });
    await expect(
      limiter.execute(async () => {
        throw new Error("failed");
      }),
    ).rejects.toThrow("failed");
    expect(await limiter.execute(async () => "next page")).toBe("next page");
    expect(delays).toEqual([400, 400]);
  });
});
