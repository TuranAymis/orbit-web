import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { EventDetail, EventListItem } from "@/entities/event/model/types";
import type { GroupDetail } from "@/entities/group/model/types";
import { useEventDetail } from "@/features/events/get-event-detail/model/useEventDetail";
import * as eventDetailApi from "@/features/events/get-event-detail/api/getEventDetail";
import * as joinEventApi from "@/features/events/join-event/api/joinEvent";
import { useGroupDetail } from "@/features/groups/get-group-detail/model/useGroupDetail";
import * as groupDetailApi from "@/features/groups/get-group-detail/api/getGroupDetail";
import * as joinGroupApi from "@/features/groups/join-group/api/joinGroup";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

const groupDetail: GroupDetail = {
  id: "frontend-forge",
  name: "Frontend Forge",
  description: "Design systems, accessibility, and UI architecture.",
  coverImageUrl: "https://example.com/group.png",
  memberCount: 120,
  isJoined: false,
  category: "Engineering",
  location: "Remote-first",
  founder: "Annie Case",
  stats: {
    weeklyPosts: 18,
    activeMembers: 84,
    upcomingEvents: 2,
  },
  upcomingEvents: [],
  galleryPreview: [],
  memberPreview: [],
};

const eventDetail: EventDetail = {
  id: "design-systems-review",
  title: "Design Systems Review",
  description: "Review token changes and component APIs.",
  coverImageUrl: "https://example.com/event.png",
  startsAt: "2026-04-08T18:00:00.000Z",
  endsAt: "2026-04-08T19:00:00.000Z",
  location: "Orbit Live Room",
  attendeeCount: 84,
  isJoined: false,
  category: "Workshop",
  host: "Annie Case",
  participantsPreview: [],
  relatedGroup: null,
};

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders queryClient={queryClient}>{children}</AppProviders>;
  }

  return { queryClient, Wrapper };
}

describe("query-backed mutations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("invalidates group detail and discover after joining a group", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    queryClient.setQueryData(orbitQueryKeys.groups.detail(groupDetail.id), groupDetail);
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue({
      ...groupDetail,
      isJoined: true,
      memberCount: groupDetail.memberCount + 1,
    });
    vi.spyOn(joinGroupApi, "joinGroup").mockResolvedValue(undefined);

    const { result } = renderHook(() => useGroupDetail(groupDetail.id), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.id).toBe(groupDetail.id);
    });

    await result.current.toggleMembership();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.detail(groupDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.discover.feed,
      });
    });
  });

  it("invalidates event detail and event list after joining an event", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const eventListItem: EventListItem = {
      id: eventDetail.id,
      title: eventDetail.title,
      description: eventDetail.description,
      coverImageUrl: eventDetail.coverImageUrl,
      startsAt: eventDetail.startsAt,
      endsAt: eventDetail.endsAt,
      location: eventDetail.location,
      attendeeCount: eventDetail.attendeeCount,
      isJoined: false,
      category: eventDetail.category,
    };
    const discoverFeed: DiscoverFeed = {
      groups: [],
      events: [eventListItem],
      trending: [],
    };

    queryClient.setQueryData(orbitQueryKeys.events.detail(eventDetail.id), eventDetail);
    queryClient.setQueryData(orbitQueryKeys.events.all, [eventListItem]);
    queryClient.setQueryData(orbitQueryKeys.discover.feed, discoverFeed);

    vi.spyOn(eventDetailApi, "getEventDetail").mockResolvedValue({
      ...eventDetail,
      isJoined: true,
      attendeeCount: eventDetail.attendeeCount + 1,
    });
    vi.spyOn(joinEventApi, "joinEvent").mockResolvedValue(undefined);

    const { result } = renderHook(() => useEventDetail(eventDetail.id), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.id).toBe(eventDetail.id);
    });

    await result.current.toggleAttendance();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.detail(eventDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.all,
      });
    });
  });
});
