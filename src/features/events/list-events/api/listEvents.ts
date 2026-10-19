import { appConfig } from "@/config/appConfig";
import { mapEventListResponse } from "@/entities/event/mappers";
import type { EventListItem } from "@/entities/event/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";
import { getStoredUserId } from "@/features/auth/auth-storage";
import { readThrough } from "@/shared/lib/offline/offlineCache";

export async function listEvents(): Promise<EventListItem[]> {
  return readThrough({ userId: getStoredUserId(), key: "events:list", fetcher: fetchEvents });
}

async function fetchEvents(): Promise<EventListItem[]> {
  const payload = await httpClient.get<unknown>("/events");
  const mappedEvents = mapEventListResponse(payload);

  if (appConfig.isDevelopment) {
    console.log("RAW EVENTS:", payload);
    console.log("MAPPED EVENTS:", mappedEvents);
  }

  return mappedEvents;
}
