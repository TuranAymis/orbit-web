import { describe, expect, it, vi } from "vitest";
import { deleteEvent } from "@/features/events/delete-event/api/deleteEvent";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

describe("deleteEvent API", () => {
  it("calls DELETE /events/:id", async () => {
    const deleteSpy = vi.spyOn(httpClient, "delete").mockResolvedValue(undefined);

    await deleteEvent("event_1");

    expect(deleteSpy).toHaveBeenCalledWith("/events/event_1");
  });

  it("surfaces a clear permission message on 403", async () => {
    vi.spyOn(httpClient, "delete").mockRejectedValue(new HttpError("Forbidden", 403));

    await expect(deleteEvent("event_1")).rejects.toThrow(
      /don't have permission to delete this event/i,
    );
  });
});
