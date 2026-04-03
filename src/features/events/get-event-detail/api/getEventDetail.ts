import { mapEventDetailResponse } from "@/entities/event/mappers";
import type { EventDetail } from "@/entities/event/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

export async function getEventDetail(eventId: string): Promise<EventDetail> {
  const payload = await httpClient.get<unknown>(`/events/${encodeURIComponent(eventId)}`);

  return mapEventDetailResponse(payload as Parameters<typeof mapEventDetailResponse>[0]);
}
