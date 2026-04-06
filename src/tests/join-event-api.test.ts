import { beforeEach, describe, expect, it, vi } from "vitest";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";

describe("joinEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the backend join endpoint with POST /events/:id/join", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await joinEvent("evt_123");

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/events/evt_123/join",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
