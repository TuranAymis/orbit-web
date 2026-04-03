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
        coverImageUrl: "https://example.com/cover.png",
        startsAt: "2026-04-08T18:00:00.000Z",
        endsAt: "2026-04-08T19:00:00.000Z",
        location: "Orbit Room",
        attendeeCount: 42,
        isJoined: false,
        category: "Workshop",
      },
    ]);

    expect(result[0]?.title).toBe("Design Systems Review");
    expect(result[0]?.attendeeCount).toBe(42);
  });

  it("maps detail payloads into the event detail domain shape", () => {
    const result = mapEventDetailResponse({
      id: "evt_1",
      title: "Design Systems Review",
      description: "Review tokens and API changes.",
      coverImageUrl: "https://example.com/cover.png",
      startsAt: "2026-04-08T18:00:00.000Z",
      endsAt: "2026-04-08T19:00:00.000Z",
      location: "Orbit Room",
      attendeeCount: 42,
      isJoined: true,
      category: "Workshop",
      host: "Annie Case",
      relatedGroup: {
        id: "frontend-forge",
        name: "Frontend Forge",
        description: "A frontend community",
      },
      participantsPreview: [
        {
          id: "mem_1",
          name: "Eli Turner",
          avatarFallback: "ET",
          role: "Moderator",
        },
      ],
    });

    expect(result.relatedGroup?.name).toBe("Frontend Forge");
    expect(result.participantsPreview[0]?.avatarFallback).toBe("ET");
  });
});
