import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    await httpClient.delete(`/events/${eventId}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      throw new Error("You don't have permission to delete this event");
    }

    throw error;
  }
}
