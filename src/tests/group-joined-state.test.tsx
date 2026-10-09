import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import * as listGroupsApi from "@/features/groups/list-groups/api/listGroups";
import * as joinGroupApi from "@/features/groups/join-group/api/joinGroup";
import { useGroups } from "@/features/groups/list-groups/model/useGroups";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import type { Group, GroupDetail } from "@/entities/group/model/types";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

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
    return (
      <AppProviders queryClient={queryClient} initialSession={demoSession}>
        {children}
      </AppProviders>
    );
  }

  return { queryClient, Wrapper };
}

describe("group joined-state synchronization", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves joined state in the groups list when the backend list payload omits it", async () => {
    const { queryClient, Wrapper } = createWrapper();

    queryClient.setQueryData(orbitQueryKeys.groups.joinedState, {
      "frontend-forge": true,
    });

    vi.spyOn(listGroupsApi, "listGroups").mockResolvedValue([
      {
        id: "frontend-forge",
        name: "Frontend Forge",
        description: "UI systems and accessibility.",
        memberCount: 9840,
        imageUrl: "https://example.com/group.png",
        isJoined: false,
      },
    ]);

    const { result } = renderHook(() => useGroups(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data[0]?.isJoined).toBe(true);
  });

  it("updates groups list, discover feed, detail cache, and joined-state cache after joining", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const group: Group = {
      id: "frontend-forge",
      name: "Frontend Forge",
      description: "UI systems and accessibility.",
      memberCount: 9840,
      imageUrl: "https://example.com/group.png",
      isJoined: false,
    };

    queryClient.setQueryData(orbitQueryKeys.groups.all, [group]);
    queryClient.setQueryData<GroupDetail>(orbitQueryKeys.groups.detail(group.id), {
      ...group,
      canCreateEvents: false,
      coverImageUrl: group.imageUrl,
      category: "Engineering",
      location: "Remote",
      founder: "Orbit Team",
      stats: {
        weeklyPosts: 3,
        activeMembers: 12,
        upcomingEvents: 1,
      },
      upcomingEvents: [],
      galleryPreview: [],
      memberPreview: [],
    });
    queryClient.setQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed, {
      groups: [group],
      events: [],
      trending: [],
    });

    const joinSpy = vi.spyOn(joinGroupApi, "joinGroup").mockResolvedValue(undefined);

    const { result } = renderHook(() => useJoinGroup(), {
      wrapper: Wrapper,
    });

    await result.current.joinById(group.id);

    await waitFor(() => {
      expect(joinSpy).toHaveBeenCalledWith(group.id);
      expect(
        queryClient.getQueryData<Group[]>(orbitQueryKeys.groups.all)?.[0],
      ).toMatchObject({
        isJoined: true,
        memberCount: group.memberCount + 1,
      });
      expect(
        queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed)?.groups[0],
      ).toMatchObject({
        isJoined: true,
        memberCount: group.memberCount + 1,
      });
      expect(
        queryClient.getQueryData(orbitQueryKeys.groups.detail(group.id)),
      ).toMatchObject({
        isJoined: true,
        memberCount: group.memberCount + 1,
      });
      expect(
        queryClient.getQueryData<Record<string, boolean>>(orbitQueryKeys.groups.joinedState),
      ).toMatchObject({
        [group.id]: true,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.chat.conversations,
      });
    });
  });

  it("restores the rendered join button after a failed first join", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const group: Group = {
      id: "frontend-forge",
      name: "Frontend Forge",
      description: "UI systems and accessibility.",
      memberCount: 9840,
      imageUrl: "https://example.com/group.png",
      isJoined: false,
    };
    queryClient.setQueryData(orbitQueryKeys.groups.list, [group]);
    vi.spyOn(listGroupsApi, "listGroups").mockResolvedValue([group]);
    vi.spyOn(joinGroupApi, "joinGroup").mockRejectedValue(new Error("Join failed"));

    function JoinState() {
      const { data } = useGroups();
      const { joinById, error } = useJoinGroup();
      const isJoined = data[0]?.isJoined ?? false;
      return (
        <div>
          <span>{isJoined ? "Joined" : "Not joined"}</span>
          {error ? <span>{error.message}</span> : null}
          <button disabled={isJoined} onClick={() => void joinById(group.id).catch(() => {})}>
            {isJoined ? "Joined" : "Join group"}
          </button>
        </div>
      );
    }

    render(<JoinState />, { wrapper: Wrapper });
    await userEvent.setup().click(screen.getByRole("button", { name: "Join group" }));

    await waitFor(() => {
      expect(screen.getByText("Join failed")).toBeInTheDocument();
      expect(screen.getByText("Not joined")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Join group" })).toBeEnabled();
      expect(queryClient.getQueryData(orbitQueryKeys.groups.joinedState)).toBeUndefined();
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: orbitQueryKeys.chat.conversations,
      });
    });
  });
});
