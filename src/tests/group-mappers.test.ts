import { describe, expect, it } from "vitest";
import { mapGroupDetailResponse } from "@/entities/group/mappers";

describe("group mappers", () => {
  it("maps backend payloads into the group detail domain shape", () => {
    const result = mapGroupDetailResponse({
      id: "frontend-forge",
      name: "Frontend Forge",
      description: "A place for frontend engineers.",
      coverImageUrl: "https://example.com/cover.png",
      memberCount: 3400,
      isJoined: true,
      category: "Engineering",
      location: "Remote-first",
      founder: "Annie Case",
      stats: {
        weeklyPosts: 21,
        activeMembers: 420,
        upcomingEvents: 2,
      },
      upcomingEvents: [
        {
          id: "evt_1",
          title: "UI Review",
          startsAt: "2026-04-08T18:00:00.000Z",
          location: "Orbit Room",
        },
      ],
      galleryPreview: [
        {
          id: "gal_1",
          imageUrl: "https://example.com/gallery.png",
          alt: "Gallery item",
        },
      ],
      memberPreview: [
        {
          id: "mem_1",
          name: "Eli Turner",
          avatarFallback: "ET",
          role: "Moderator",
        },
      ],
    });

    expect(result.name).toBe("Frontend Forge");
    expect(result.stats.activeMembers).toBe(420);
    expect(result.memberPreview[0]?.avatarFallback).toBe("ET");
  });
});
