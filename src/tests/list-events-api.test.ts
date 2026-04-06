import { describe, expect, it, vi } from "vitest";
import { listEvents } from "@/features/events/list-events/api/listEvents";
import { httpClient } from "@/shared/lib/http/httpClient";

describe("listEvents API", () => {
  it("maps backend event rows that use image_url and starts_at fields", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValue([
      {
        id: "event_1",
        group_id: "8ee554fc-667e-4f0f-a3a7-025bd8d26d59",
        title: "Canli Muzik",
        description: "Mabel Matiz Konseri",
        image_url:
          "https://cdn.bubilet.com.tr/files/Etkinlik/mabel-matiz-konseri--20529.png",
        location: "Kadikoy",
        starts_at: "2026-04-11T08:10:00.000Z",
        ends_at: "2026-04-12T09:10:00.000Z",
        attendee_count: 24,
        is_joined: false,
      },
      {
        id: "event_2",
        group_id: "0df839fe-7391-4d25-abc8-e63b39018c82",
        title: "Sureyya Plajinda Sohbet",
        description: "Sandalyeni kap gel",
        image_url: "https://media-cdn.tripadvisor.com/media/photo-s/1b/a4/41/67/maltepe-sahil.jpg",
        location: "Sureyya Plaji",
        starts_at: "2026-04-12T09:01:00.000Z",
        ends_at: "2026-04-12T10:01:00.000Z",
        attendee_count: 7,
        is_joined: true,
      },
    ]);

    const result = await listEvents();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      title: "Canli Muzik",
      description: "Mabel Matiz Konseri",
      coverImageUrl:
        "https://cdn.bubilet.com.tr/files/Etkinlik/mabel-matiz-konseri--20529.png",
      location: "Kadikoy",
      attendeeCount: 24,
    });
    expect(result[1]).toMatchObject({
      title: "Sureyya Plajinda Sohbet",
      description: "Sandalyeni kap gel",
      coverImageUrl:
        "https://media-cdn.tripadvisor.com/media/photo-s/1b/a4/41/67/maltepe-sahil.jpg",
      isJoined: true,
    });
  });

  it("unwraps wrapped event collections safely", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValue({
      data: [
        {
          id: "event_1",
          title: "Canli Muzik",
          description: "Mabel Matiz Konseri",
          image_url: "https://example.com/event.png",
          location: "Kadikoy",
          starts_at: "2026-04-11T08:10:00.000Z",
          ends_at: "2026-04-12T09:10:00.000Z",
        },
      ],
    });

    const result = await listEvents();

    expect(result[0]?.title).toBe("Canli Muzik");
    expect(result[0]?.coverImageUrl).toBe("https://example.com/event.png");
  });
});
