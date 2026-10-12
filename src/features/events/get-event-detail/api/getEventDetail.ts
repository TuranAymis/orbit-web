import { mapEventDetailResponse } from "@/entities/event/mappers";
import type { EventDetail } from "@/entities/event/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";
import { getStoredUserId } from "@/features/auth/auth-storage";
import { readThrough } from "@/shared/lib/offline/offlineCache";

export async function getEventDetail(eventId: string): Promise<EventDetail> {
  return readThrough({ userId: getStoredUserId(), key: `event:${eventId}`, fetcher: () => fetchEventDetail(eventId) });
}

async function fetchEventDetail(eventId: string): Promise<EventDetail> {
  const payload = await httpClient.get<unknown>(`/events/${encodeURIComponent(eventId)}`);

  return mapEventDetailResponse(payload as Parameters<typeof mapEventDetailResponse>[0]);
}
