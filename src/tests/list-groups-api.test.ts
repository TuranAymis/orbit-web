import { describe, expect, it, vi } from "vitest";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";
import { httpClient } from "@/shared/lib/http/httpClient";

describe("listGroups API", () => {
  it("maps raw backend group rows into frontend groups", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValue([
      {
        id: "8ee554fc-667e-4f0f-a3a7-025bd8d26d59",
        name: "Kadikoy",
        description: "Kadikoy grubu",
        image_url:
          "https://www.gazetekadikoy.com.tr/Uploads/gazetekadikoy.com.tr/202204211832531-img.jpg",
        category: "Semt",
        location: "Kadikoy",
        member_count: 12,
      },
      {
        id: "0df839fe-7391-4d25-abc8-e63b39018c82",
        name: "Maltepe",
        description: "Maltepe Semt",
        image_url:
          "https://media-cdn.tripadvisor.com/media/photo-m/1280/1b/51/f1/e0/maltepe-sahil.jpg",
        category: "Semt",
        location: "Maltepe",
        member_count: 8,
      },
    ]);

    const result = await listGroups();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: "Kadikoy",
      description: "Kadikoy grubu",
      imageUrl:
        "https://www.gazetekadikoy.com.tr/Uploads/gazetekadikoy.com.tr/202204211832531-img.jpg",
      memberCount: 12,
    });
    expect(result[1]).toMatchObject({
      name: "Maltepe",
      description: "Maltepe Semt",
      imageUrl:
        "https://media-cdn.tripadvisor.com/media/photo-m/1280/1b/51/f1/e0/maltepe-sahil.jpg",
      memberCount: 8,
    });
  });

  it("unwraps wrapped group collections safely", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValue({
      items: [
        {
          id: "group_1",
          name: "Kadikoy",
          description: "Kadikoy grubu",
          image_url: "https://example.com/kadikoy.jpg",
          member_count: 3,
        },
      ],
    });

    const result = await listGroups();

    expect(result[0]?.name).toBe("Kadikoy");
    expect(result[0]?.imageUrl).toBe("https://example.com/kadikoy.jpg");
  });
});
