import { orbitRuntimeConfig } from "@/config/env";
import { mapEventListResponse } from "@/entities/event/mappers";
import type { EventListItem } from "@/entities/event/model/types";

export async function listEvents(): Promise<EventListItem[]> {
  const response = await fetch(`${orbitRuntimeConfig.apiBaseUrl}/events`);

  if (!response.ok) {
    throw new Error("Failed to load events.");
  }

  const payload = (await response.json()) as unknown;

  return mapEventListResponse(payload as Parameters<typeof mapEventListResponse>[0]);
}
