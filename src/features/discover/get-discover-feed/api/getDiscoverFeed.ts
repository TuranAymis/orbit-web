import { orbitRuntimeConfig } from "@/config/env";
import {
  mapDiscoverFeedResponse,
  type DiscoverFeed,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";

async function getJsonOrThrow(path: string): Promise<unknown> {
  const response = await fetch(`${orbitRuntimeConfig.apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error("Failed to load discover feed.");
  }

  return (await response.json()) as unknown;
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
