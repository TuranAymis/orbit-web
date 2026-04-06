import { describe, expect, it } from "vitest";
import { mapGroupDetailResponse, mapGroupListResponse } from "@/entities/group/mappers";

describe("group mappers", () => {
  it("maps backend list payloads into the group list domain shape", () => {
    const result = mapGroupListResponse([
      {
        id: "frontend-forge",
        name: "Frontend Forge",
        description: "A place for frontend engineers.",
        image_url: "https://example.com/cover.png",
        member_count: 3400,
        is_joined: true,
      },
    ]);

    expect(result[0]?.memberCount).toBe(3400);
    expect(result[0]?.isJoined).toBe(true);
    expect(result[0]?.imageUrl).toBe("https://example.com/cover.png");
  });

  it("accepts alternate joined field names without dropping valid joined state", () => {
    const result = mapGroupListResponse([
      {
        id: "kadikoy",
        name: "Kadikoy",
        description: "Semt toplulugu.",
        image_url: "https://example.com/kadikoy.png",
        member_count: 24,
        joined: true,
      },
    ]);

    expect(result[0]?.isJoined).toBe(true);
  });

  it("maps backend payloads into the group detail domain shape", () => {
    const result = mapGroupDetailResponse({
      id: "frontend-forge",
      name: "Frontend Forge",
      description: "A place for frontend engineers.",
      cover_image_url: "https://example.com/cover.png",
      member_count: 3400,
      is_joined: true,
      category: "Engineering",
      location: "Remote-first",
      founder: {
        id: "usr_1",
        name: "Annie Case",
      },
      stats: {
        posts: 21,
        members: 420,
        events: 2,
      },
      upcoming_events: [
        {
          id: "evt_1",
          title: "UI Review",
          starts_at: "2026-04-08T18:00:00.000Z",
        },
      ],
      gallery_preview: ["https://example.com/gallery.png"],
      member_preview: [
        {
          id: "mem_1",
          name: "Eli Turner",
          avatar_url: "https://example.com/avatar.png",
        },
      ],
    });

    expect(result.name).toBe("Frontend Forge");
    expect(result.stats.activeMembers).toBe(420);
    expect(result.memberPreview[0]?.avatarFallback).toBe("ET");
    expect(result.memberCount).toBe(3400);
    expect(result.isJoined).toBe(true);
  });
});
