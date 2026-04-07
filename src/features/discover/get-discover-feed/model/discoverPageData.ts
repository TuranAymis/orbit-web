import type { EventListItem } from "@/entities/event/model/types";
import type { Group } from "@/entities/group/model/types";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import type { DiscoverFeedResult } from "@/features/discover/get-discover-feed/api/getDiscoverFeed";

export interface DiscoverGroupsSection {
  type: "groups";
  title: string;
  description: string;
  items: Group[];
  error: string | null;
  isEmpty: boolean;
}

export interface DiscoverEventsSection {
  type: "events";
  title: string;
  description: string;
  items: EventListItem[];
  error: string | null;
  isEmpty: boolean;
}

export type DiscoverPageSection = DiscoverGroupsSection | DiscoverEventsSection;

export interface DiscoverPageData {
  sections: DiscoverPageSection[];
  isLoading: boolean;
  hasAnyContent: boolean;
  hasAnyError: boolean;
}

function toSectionError(error: Error | null | undefined, fallback: string) {
  return error ? error.message || fallback : null;
}

export function createDiscoverPageData(
  feed: DiscoverFeedResult | DiscoverFeed,
  options: {
    isLoading: boolean;
    groupsError?: Error | null;
    eventsError?: Error | null;
  },
): DiscoverPageData {
  const groupsSection: DiscoverGroupsSection = {
    type: "groups",
    title: "Groups For You",
    description: "Communities pulled from the live Orbit backend.",
    items: feed.groups,
    error: toSectionError(options.groupsError, "We couldn't load groups right now."),
    isEmpty: feed.groups.length === 0,
  };

  const eventsSection: DiscoverEventsSection = {
    type: "events",
    title: "Events For You",
    description: "Upcoming sessions and live gatherings from the backend feed.",
    items: feed.events,
    error: toSectionError(options.eventsError, "We couldn't load events right now."),
    isEmpty: feed.events.length === 0,
  };

  const sections: DiscoverPageSection[] = [groupsSection, eventsSection];

  return {
    sections,
    isLoading: options.isLoading,
    hasAnyContent: sections.some((section) => section.items.length > 0),
    hasAnyError: sections.some((section) => Boolean(section.error)),
  };
}

export function getDiscoverSection<TType extends DiscoverPageSection["type"]>(
  sections: DiscoverPageSection[],
  type: TType,
): Extract<DiscoverPageSection, { type: TType }> | undefined {
  return sections.find((section) => section.type === type) as
    | Extract<DiscoverPageSection, { type: TType }>
    | undefined;
}
