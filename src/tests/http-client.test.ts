import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

describe("httpClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns text responses when backend does not send JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("ok", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(httpClient.get<string>("/health")).resolves.toBe("ok");
  });

  it("returns undefined on empty successful responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(httpClient.get<void>("/health")).resolves.toBeUndefined();
  });

  it("throws a typed error when declared JSON is invalid", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not-json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(httpClient.get("/health")).rejects.toBeInstanceOf(HttpError);
  });
});
