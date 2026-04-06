import { describe, expect, it, vi } from "vitest";
import { deleteGroup } from "@/features/groups/delete-group/api/deleteGroup";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

describe("deleteGroup API", () => {
  it("calls DELETE /groups/:id", async () => {
    const deleteSpy = vi.spyOn(httpClient, "delete").mockResolvedValue(undefined);

    await deleteGroup("group_1");

    expect(deleteSpy).toHaveBeenCalledWith("/groups/group_1");
  });

  it("surfaces a clear admin-only message on 403", async () => {
    vi.spyOn(httpClient, "delete").mockRejectedValue(new HttpError("Forbidden", 403));

    await expect(deleteGroup("group_1")).rejects.toThrow(/only admins can delete groups/i);
  });
});
