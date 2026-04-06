import { describe, expect, it } from "vitest";
import {
  mapEventDetailResponse,
  mapEventListResponse,
} from "@/entities/event/mappers";

describe("event mappers", () => {
  it("maps list payloads into event cards", () => {
    const result = mapEventListResponse([
      {
        id: "evt_1",
        title: "Design Systems Review",
        description: "Review tokens and API changes.",
        cover_image_url: "https://example.com/cover.png",
        starts_at: "2026-04-08T18:00:00.000Z",
        ends_at: "2026-04-08T19:00:00.000Z",
        location: "Orbit Room",
        attendee_count: 42,
        is_joined: true,
      },
    ]);

    expect(result[0]?.title).toBe("Design Systems Review");
    expect(result[0]?.attendeeCount).toBe(42);
    expect(result[0]?.isJoined).toBe(true);
    expect(result[0]?.coverImageUrl).toBe("https://example.com/cover.png");
  });

  it("maps detail payloads into the event detail domain shape", () => {
    const result = mapEventDetailResponse({
      id: "evt_1",
      title: "Design Systems Review",
      description: "Review tokens and API changes.",
      cover_image_url: "https://example.com/cover.png",
      starts_at: "2026-04-08T18:00:00.000Z",
      ends_at: "2026-04-08T19:00:00.000Z",
      location: "Orbit Room",
      attendee_count: 42,
      is_joined: true,
      related_group: {
        id: "frontend-forge",
        name: "Frontend Forge",
      },
      participants_preview: [
        {
          id: "mem_1",
          name: "Eli Turner",
          avatar_url: "https://example.com/avatar.png",
          role: "Moderator",
        },
      ],
    });

    expect(result.relatedGroup?.name).toBe("Frontend Forge");
    expect(result.attendeeCount).toBe(42);
    expect(result.isJoined).toBe(true);
    expect(result.participantsPreview[0]?.role).toBe("Moderator");
  });
});
