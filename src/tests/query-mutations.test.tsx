import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import type { EventDetail, EventListItem } from "@/entities/event/model/types";
import type { GroupDetail } from "@/entities/group/model/types";
import { useEventDetail } from "@/features/events/get-event-detail/model/useEventDetail";
import { useCreateEvent } from "@/features/events/create-event/model/useCreateEvent";
import * as createEventApi from "@/features/events/create-event/api/createEvent";
import { useDeleteEvent } from "@/features/events/delete-event/model/useDeleteEvent";
import * as deleteEventApi from "@/features/events/delete-event/api/deleteEvent";
import * as eventDetailApi from "@/features/events/get-event-detail/api/getEventDetail";
import * as joinEventApi from "@/features/events/join-event/api/joinEvent";
import { useCreateGroup } from "@/features/groups/create-group/model/useCreateGroup";
import * as createGroupApi from "@/features/groups/create-group/api/createGroup";
import { useDeleteGroup } from "@/features/groups/delete-group/model/useDeleteGroup";
import * as deleteGroupApi from "@/features/groups/delete-group/api/deleteGroup";
import { useUpgradeMembership } from "@/features/membership/upgrade-membership/model/useUpgradeMembership";
import * as upgradeMembershipApi from "@/features/membership/upgrade-membership/api/upgradeMembership";
import { useGroupDetail } from "@/features/groups/get-group-detail/model/useGroupDetail";
import * as groupDetailApi from "@/features/groups/get-group-detail/api/getGroupDetail";
import * as joinGroupApi from "@/features/groups/join-group/api/joinGroup";
import { readStoredSession, writeStoredSession } from "@/features/auth/auth-storage";
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

const demoSession: AuthSession = {
  isAuthenticated: true,
  accessToken: "test-access-token",
  tokenType: "bearer",
  expiresIn: 3600,
  user: {
    id: "user_demo",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    role: "user",
    avatarFallback: "DO",
  },
};

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders queryClient={queryClient} initialSession={demoSession}>{children}</AppProviders>;
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
    const groupListItem = {
      id: groupDetail.id,
      name: groupDetail.name,
      description: groupDetail.description,
      memberCount: groupDetail.memberCount,
      imageUrl: groupDetail.coverImageUrl,
      isJoined: false,
    };

    queryClient.setQueryData(orbitQueryKeys.groups.detail(groupDetail.id), groupDetail);
    queryClient.setQueryData(orbitQueryKeys.groups.all, [groupListItem]);
    queryClient.setQueryData(orbitQueryKeys.discover.feed, {
      groups: [groupListItem],
      events: [],
      trending: [],
    });
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
      expect(result.current.data?.isJoined).toBe(true);
      expect(result.current.data?.memberCount).toBe(groupDetail.memberCount + 1);
      expect(
        queryClient.getQueryData<typeof groupListItem[]>(orbitQueryKeys.groups.all)?.[0],
      ).toMatchObject({
        isJoined: true,
        memberCount: groupDetail.memberCount + 1,
      });
      expect(
        queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed)?.groups[0],
      ).toMatchObject({
        isJoined: true,
        memberCount: groupDetail.memberCount + 1,
      });
      expect(
        queryClient.getQueryData<Record<string, boolean>>(orbitQueryKeys.groups.joinedState),
      ).toMatchObject({
        [groupDetail.id]: true,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.all,
      });
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
      expect(result.current.data?.isJoined).toBe(true);
      expect(result.current.data?.attendeeCount).toBe(eventDetail.attendeeCount + 1);
      expect(
        queryClient.getQueryData<EventListItem[]>(orbitQueryKeys.events.all)?.[0],
      ).toMatchObject({
        isJoined: true,
        attendeeCount: eventDetail.attendeeCount + 1,
      });
      expect(
        queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed)?.events[0],
      ).toMatchObject({
        isJoined: true,
        attendeeCount: eventDetail.attendeeCount + 1,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.detail(eventDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.all,
      });
    });
  });

  it("rolls back group caches when joining a group fails", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const groupListItem = {
      id: groupDetail.id,
      name: groupDetail.name,
      description: groupDetail.description,
      memberCount: groupDetail.memberCount,
      imageUrl: groupDetail.coverImageUrl,
      isJoined: false,
    };

    queryClient.setQueryData(orbitQueryKeys.groups.detail(groupDetail.id), groupDetail);
    queryClient.setQueryData(orbitQueryKeys.groups.list, [groupListItem]);
    queryClient.setQueryData(orbitQueryKeys.discover.feed, {
      groups: [groupListItem],
      events: [],
      trending: [],
    });

    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupDetail);
    vi.spyOn(joinGroupApi, "joinGroup").mockRejectedValue(new Error("Join failed"));

    const { result } = renderHook(() => useGroupDetail(groupDetail.id), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.id).toBe(groupDetail.id);
    });

    await expect(result.current.toggleMembership()).rejects.toThrow(/join failed/i);

    await waitFor(() => {
      expect(
        queryClient.getQueryData<typeof groupListItem[]>(orbitQueryKeys.groups.list)?.[0],
      ).toMatchObject({
        isJoined: false,
        memberCount: groupDetail.memberCount,
      });
      expect(
        queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed)?.groups[0],
      ).toMatchObject({
        isJoined: false,
        memberCount: groupDetail.memberCount,
      });
      expect(
        queryClient.getQueryData<GroupDetail>(orbitQueryKeys.groups.detail(groupDetail.id)),
      ).toMatchObject({
        isJoined: false,
        memberCount: groupDetail.memberCount,
      });
    });
  });

  it("rolls back event caches when joining an event fails", async () => {
    const { queryClient, Wrapper } = createWrapper();

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

    queryClient.setQueryData(orbitQueryKeys.events.detail(eventDetail.id), eventDetail);
    queryClient.setQueryData(orbitQueryKeys.events.list, [eventListItem]);
    queryClient.setQueryData(orbitQueryKeys.discover.feed, {
      groups: [],
      events: [eventListItem],
      trending: [],
    });

    vi.spyOn(eventDetailApi, "getEventDetail").mockResolvedValue(eventDetail);
    vi.spyOn(joinEventApi, "joinEvent").mockRejectedValue(new Error("Join failed"));

    const { result } = renderHook(() => useEventDetail(eventDetail.id), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.id).toBe(eventDetail.id);
    });

    await expect(result.current.toggleAttendance()).rejects.toThrow(/join failed/i);

    await waitFor(() => {
      expect(
        queryClient.getQueryData<EventListItem[]>(orbitQueryKeys.events.list)?.[0],
      ).toMatchObject({
        isJoined: false,
        attendeeCount: eventDetail.attendeeCount,
      });
      expect(
        queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed)?.events[0],
      ).toMatchObject({
        isJoined: false,
        attendeeCount: eventDetail.attendeeCount,
      });
      expect(
        queryClient.getQueryData<EventDetail>(orbitQueryKeys.events.detail(eventDetail.id)),
      ).toMatchObject({
        isJoined: false,
        attendeeCount: eventDetail.attendeeCount,
      });
    });
  });

  it("invalidates groups and discover after creating a group", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(createGroupApi, "createGroup").mockResolvedValue({
      id: "group_42",
      ownerId: "admin_1",
      name: "Orbit Builders",
      description: "A new community",
      coverImageUrl: null,
      category: "Engineering",
      location: "Remote-first",
      createdAt: "2026-04-06T12:00:00.000Z",
      updatedAt: "2026-04-06T12:00:00.000Z",
    });

    const { result } = renderHook(() => useCreateGroup(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync({
      name: "Orbit Builders",
      description: "A new community",
      category: "Engineering",
      location: "Remote-first",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.discover.feed,
      });
    });
  });

  it("invalidates events, group detail, and discover after creating an event", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(createEventApi, "createEvent").mockResolvedValue({
      id: "event_42",
      groupId: groupDetail.id,
      title: "Orbit Launch Review",
    });

    const { result } = renderHook(() => useCreateEvent(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync({
      groupId: groupDetail.id,
      title: "Orbit Launch Review",
      description: "Rollout planning and QA review.",
      location: "Orbit Live Room",
      startsAt: "2026-04-08T18:00",
      endsAt: "2026-04-08T19:00",
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.detail("event_42"),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.detail(groupDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.discover.feed,
      });
    });
  });

  it("invalidates groups and discover after deleting a group", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(deleteGroupApi, "deleteGroup").mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteGroup(groupDetail.id), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.detail(groupDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.discover.feed,
      });
    });
  });

  it("invalidates events, event detail, discover, and group detail after deleting an event", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(deleteEventApi, "deleteEvent").mockResolvedValue(undefined);

    const { result } = renderHook(
      () => useDeleteEvent({ eventId: eventDetail.id, groupId: groupDetail.id }),
      {
        wrapper: Wrapper,
      },
    );

    await result.current.mutateAsync();

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.all,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.events.detail(eventDetail.id),
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.discover.feed,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.groups.detail(groupDetail.id),
      });
    });
  });

  it("updates membership cache and stored session after upgrading", async () => {
    const { queryClient, Wrapper } = createWrapper();

    writeStoredSession(demoSession);
    queryClient.setQueryData(orbitQueryKeys.membership.current, {
      tier: "free",
      status: "active",
      startedAt: "2026-03-01T12:00:00.000Z",
      renewsAt: "2026-05-01T12:00:00.000Z",
      benefits: [],
      limits: {
        groupJoinsPerMonth: 10,
        eventRsvpsPerMonth: 8,
        storageGb: 1,
      },
    });
    vi.spyOn(upgradeMembershipApi, "upgradeMembership").mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpgradeMembership(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<{ tier: string }>(orbitQueryKeys.membership.current)?.tier,
      ).toBe("premium");
      expect(readStoredSession()?.user.membershipTier).toBe("Premium");
    });
  });
});
