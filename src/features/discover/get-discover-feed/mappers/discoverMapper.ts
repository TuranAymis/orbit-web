import { mapEventListResponse } from "@/entities/event/mappers";
import type { EventListItem } from "@/entities/event/model/types";
import type { Group } from "@/entities/group/model/types";

interface GroupListResponseItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  memberCount?: number;
}

interface DiscoverTrendItemResponse {
  id?: string;
  title?: string;
  description?: string;
  metricLabel?: string;
  metricValue?: string;
  kind?: "group" | "event";
}

export interface DiscoverTrendItem {
  id: string;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  kind?: "group" | "event";
}

export interface DiscoverFeed {
  groups: Group[];
  events: EventListItem[];
  trending: DiscoverTrendItem[];
}

interface DiscoverFeedResponse {
  groupsPayload: unknown;
  eventsPayload: unknown;
  trendingPayload?: unknown;
}

function getCollection(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of keys) {
    const candidate = (payload as Record<string, unknown>)[key];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function mapGroupListResponse(payload: unknown): Group[] {
  return getCollection(payload, ["groups", "items", "data"]).map((item, index) => {
    const group = item as Partial<GroupListResponseItem>;

    return {
      id: group.id ?? `group_${index}`,
      name: group.name ?? "Orbit Group",
      description: group.description ?? "No group description available yet.",
      memberCount: group.memberCount ?? 0,
      imageUrl:
        group.imageUrl ??
        group.coverImageUrl ??
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    };
  });
}

function deriveTrending(groups: Group[], events: EventListItem[]): DiscoverTrendItem[] {
  const groupTrends = [...groups]
    .sort((left, right) => right.memberCount - left.memberCount)
    .slice(0, 2)
    .map((group) => ({
      id: `trend_group_${group.id}`,
      title: `${group.name} is trending`,
      description: group.description,
      metricLabel: "Members",
      metricValue: group.memberCount.toLocaleString(),
      kind: "group" as const,
    }));

  const eventTrends = [...events]
    .sort((left, right) => right.attendeeCount - left.attendeeCount)
    .slice(0, 2)
    .map((event) => ({
      id: `trend_event_${event.id}`,
      title: `${event.title} is gaining momentum`,
      description: event.description,
      metricLabel: "Attendees",
      metricValue: event.attendeeCount.toLocaleString(),
      kind: "event" as const,
    }));

  return [...groupTrends, ...eventTrends];
}

function mapTrendingResponse(
  payload: unknown,
  groups: Group[],
  events: EventListItem[],
): DiscoverTrendItem[] {
  const items = getCollection(payload, ["trending", "items", "data"]);

  if (items.length === 0) {
    return deriveTrending(groups, events);
  }

  return items.map((item, index) => {
    const trend = item as DiscoverTrendItemResponse;

    return {
      id: trend.id ?? `trend_${index}`,
      title: trend.title ?? "Orbit signal",
      description: trend.description ?? "Discover activity is picking up across Orbit.",
      metricLabel: trend.metricLabel ?? "Momentum",
      metricValue: trend.metricValue ?? "Rising",
      kind: trend.kind ?? "group",
    };
  });
}

export function mapDiscoverFeedResponse({
  groupsPayload,
  eventsPayload,
  trendingPayload,
}: DiscoverFeedResponse): DiscoverFeed {
  const groups = mapGroupListResponse(groupsPayload);
  const events = mapEventListResponse(
    getCollection(eventsPayload, ["events", "items", "data"]) as Parameters<
      typeof mapEventListResponse
    >[0],
  );

  return {
    groups,
    events,
    trending: mapTrendingResponse(trendingPayload, groups, events),
  };
}
