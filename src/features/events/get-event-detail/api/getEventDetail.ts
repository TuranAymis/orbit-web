import { orbitRuntimeConfig } from "@/config/env";
import { mapEventDetailResponse } from "@/entities/event/mappers";
import type { EventDetail } from "@/entities/event/model/types";

export async function getEventDetail(eventId: string): Promise<EventDetail> {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/events/${encodeURIComponent(eventId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load event detail.");
  }

  const payload = (await response.json()) as unknown;

  return mapEventDetailResponse(payload as Parameters<typeof mapEventDetailResponse>[0]);
}
