import { mapEventListResponse } from "@/entities/event/mappers";
import type { EventListItem } from "@/entities/event/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

export async function listEvents(): Promise<EventListItem[]> {
  const payload = await httpClient.get<unknown>("/events");

  return mapEventListResponse(payload as Parameters<typeof mapEventListResponse>[0]);
}
