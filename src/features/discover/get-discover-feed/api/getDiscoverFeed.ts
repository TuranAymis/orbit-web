import {
  mapDiscoverFeedResponse,
  type DiscoverFeed,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { httpClient } from "@/shared/lib/http/httpClient";

async function getJsonOrThrow(path: string): Promise<unknown> {
  return httpClient.get<unknown>(path);
}

export async function getDiscoverFeed(): Promise<DiscoverFeed> {
  const [groupsPayload, eventsPayload] = await Promise.all([
    getJsonOrThrow("/groups"),
    getJsonOrThrow("/events"),
  ]);

  return mapDiscoverFeedResponse({
    groupsPayload,
    eventsPayload,
  });
}
