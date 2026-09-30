import { beforeEach, describe, expect, it, vi } from "vitest";
import { leaveGroup } from "@/features/groups/leave-group/api/leaveGroup";

describe("leaveGroup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls the backend leave endpoint with DELETE /groups/:id/members/me", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await leaveGroup("grp_123");

    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/groups/grp_123/members/me",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });

  it("propagates backend errors so the UI can roll back", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Not a member." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(leaveGroup("grp_123")).rejects.toBeTruthy();
  });
});
