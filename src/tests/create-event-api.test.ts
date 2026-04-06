import { describe, expect, it, vi } from "vitest";
import { createEvent } from "@/features/events/create-event/api/createEvent";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

describe("createEvent API", () => {
  it("calls POST /events with the backend payload shape", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValue({
      id: "event_1",
      group_id: "group_1",
      title: "Orbit Launch Review",
    });

    await createEvent({
      groupId: "group_1",
      title: "Orbit Launch Review",
      description: "Ship review and rollout planning.",
      coverImageUrl: "https://example.com/event.png",
      location: "Orbit Live Room",
      startsAt: "2026-04-08T18:00",
      endsAt: "2026-04-08T19:00",
    });

    expect(postSpy).toHaveBeenCalledWith("/events", {
      group_id: "group_1",
      title: "Orbit Launch Review",
      description: "Ship review and rollout planning.",
      cover_image_url: "https://example.com/event.png",
      location: "Orbit Live Room",
      start_time: "2026-04-08T18:00",
      end_time: "2026-04-08T19:00",
    });
  });

  it("surfaces a clear permission message on 403", async () => {
    vi.spyOn(httpClient, "post").mockRejectedValue(new HttpError("Forbidden", 403));

    await expect(
      createEvent({
        groupId: "group_1",
        title: "Orbit Launch Review",
        location: "Orbit Live Room",
        startsAt: "2026-04-08T18:00",
        endsAt: "2026-04-08T19:00",
      }),
    ).rejects.toThrow(/don't have permission to create events in this group/i);
  });
});
