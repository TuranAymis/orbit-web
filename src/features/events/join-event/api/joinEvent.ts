import { httpClient } from "@/shared/lib/http/httpClient";

export async function joinEvent(eventId: string) {
  await httpClient.post<void>(`/events/${eventId}/join`);
}
