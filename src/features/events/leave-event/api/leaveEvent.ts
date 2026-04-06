import { httpClient } from "@/shared/lib/http/httpClient";

export async function leaveEvent(eventId: string) {
  await httpClient.post<void>(`/events/${eventId}/leave`);
}
