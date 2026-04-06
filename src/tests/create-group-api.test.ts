import { describe, expect, it, vi } from "vitest";
import { createGroup } from "@/features/groups/create-group/api/createGroup";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

describe("createGroup API", () => {
  it("calls POST /groups with the backend payload shape", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValue({
      id: "group_1",
      owner_id: "admin_1",
      name: "Orbit Builders",
      description: "A place for people building Orbit.",
      cover_image_url: "https://example.com/group.png",
      category: "Engineering",
      location: "Remote-first",
      created_at: "2026-04-06T10:00:00.000Z",
      updated_at: "2026-04-06T10:00:00.000Z",
    });

    await createGroup({
      name: "Orbit Builders",
      description: "A place for people building Orbit.",
      coverImageUrl: "https://example.com/group.png",
      category: "Engineering",
      location: "Remote-first",
    });

    expect(postSpy).toHaveBeenCalledWith("/groups", {
      name: "Orbit Builders",
      description: "A place for people building Orbit.",
      cover_image_url: "https://example.com/group.png",
      category: "Engineering",
      location: "Remote-first",
    });
  });

  it("surfaces a clear admin-only message on 403", async () => {
    vi.spyOn(httpClient, "post").mockRejectedValue(new HttpError("Forbidden", 403));

    await expect(createGroup({ name: "Orbit Builders" })).rejects.toThrow(
      /only admins can create groups/i,
    );
  });
});
