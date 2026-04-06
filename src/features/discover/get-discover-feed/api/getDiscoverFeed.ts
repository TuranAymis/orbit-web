import {
  mapDiscoverFeedResponse,
  type DiscoverFeed,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { appConfig } from "@/config/appConfig";
import { listEvents } from "@/features/events/list-events/api/listEvents";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";

export interface DiscoverFeedResult extends DiscoverFeed {
  groupsError?: Error | null;
  eventsError?: Error | null;
}

export async function getDiscoverFeed(): Promise<DiscoverFeedResult> {
  const [groupsResult, eventsResult] = await Promise.allSettled([
    listGroups(),
    listEvents(),
  ]);

  const groups = groupsResult.status === "fulfilled" ? groupsResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];

  if (appConfig.isDevelopment) {
    console.info("[orbit:discover] feed orchestration", {
      groupsLoaded: groupsResult.status === "fulfilled",
      eventsLoaded: eventsResult.status === "fulfilled",
      groupsError:
        groupsResult.status === "rejected"
          ? groupsResult.reason instanceof Error
            ? groupsResult.reason.message
            : "Unknown error"
          : null,
      eventsError:
        eventsResult.status === "rejected"
          ? eventsResult.reason instanceof Error
            ? eventsResult.reason.message
            : "Unknown error"
          : null,
    });
  }

  const mappedFeed = mapDiscoverFeedResponse({
    groupsPayload: groups,
    eventsPayload: events,
  });

  return {
    ...mappedFeed,
    groupsError:
      groupsResult.status === "rejected"
        ? groupsResult.reason instanceof Error
          ? groupsResult.reason
          : new Error("Failed to load groups.")
        : null,
    eventsError:
      eventsResult.status === "rejected"
        ? eventsResult.reason instanceof Error
          ? eventsResult.reason
          : new Error("Failed to load events.")
        : null,
  };
}
