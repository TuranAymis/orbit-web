import { appConfig } from "@/config/appConfig";
import { mapEventListResponse } from "@/entities/event/mappers";
import type { EventListItem } from "@/entities/event/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

function normalizeListResponse(payload: unknown): Parameters<typeof mapEventListResponse>[0] {
  if (Array.isArray(payload)) {
    return payload as Parameters<typeof mapEventListResponse>[0];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of ["items", "data", "events"]) {
    const candidate = (payload as Record<string, unknown>)[key];

    if (Array.isArray(candidate)) {
      return candidate as Parameters<typeof mapEventListResponse>[0];
    }
  }

  return [];
}

export async function listEvents(): Promise<EventListItem[]> {
  const payload = await httpClient.get<unknown>("/events");
  const events = normalizeListResponse(payload);
  const mappedEvents = mapEventListResponse(events);

  if (appConfig.isDevelopment) {
    console.log("RAW EVENTS:", payload);
    console.log("MAPPED EVENTS:", mappedEvents);
  }

  return mappedEvents;
}
