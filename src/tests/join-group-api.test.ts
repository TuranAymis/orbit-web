import { beforeEach, describe, expect, it, vi } from "vitest";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";

describe("joinGroup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the backend join endpoint with POST /groups/:id/members", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await joinGroup("grp_123");

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/groups/grp_123/members",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });
});
