import { createElement } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import { useDiscoverFeed } from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import * as discoverApi from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import { createDiscoverPageData } from "@/features/discover/get-discover-feed/model/discoverPageData";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

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

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(AppProviders, { queryClient, initialSession: demoSession }, children);
  };
}

describe("useDiscoverFeed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns structured discover data from the orchestration layer", async () => {
    vi.spyOn(discoverApi, "getDiscoverFeed").mockResolvedValue({
      groups: [
        {
          id: "frontend-forge",
          name: "Frontend Forge",
          description: "UI systems and accessibility.",
          memberCount: 9840,
          isJoined: false,
          imageUrl: "https://example.com/group.png",
        },
      ],
      events: [
        {
          id: "design-systems-review",
          title: "Design Systems Review",
          description: "Review component APIs.",
          coverImageUrl: "https://example.com/event.png",
          startsAt: "2026-04-08T18:00:00.000Z",
          endsAt: "2026-04-08T19:00:00.000Z",
          location: "Orbit Live Room",
          attendeeCount: 184,
          isJoined: true,
          category: "Workshop",
        },
      ],
      trending: [
        {
          id: "trend_frontend-forge",
          title: "Frontend Forge is trending",
          description: "High growth and strong activity.",
          metricLabel: "Momentum",
          metricValue: "High",
        },
      ],
      groupsError: null,
      eventsError: null,
    });

    const { result } = renderHook(() => useDiscoverFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data.isLoading).toBe(false);
    });

    expect(result.current.feed.groups[0]?.name).toBe("Frontend Forge");
    expect(result.current.feed.events[0]?.title).toBe("Design Systems Review");
    expect(result.current.data.sections[0]?.type).toBe("groups");
    expect(result.current.data.sections[1]?.type).toBe("events");
    expect(result.current.data.hasAnyContent).toBe(true);
  });

  it("keeps groups available when the events source fails", async () => {
    vi.spyOn(discoverApi, "getDiscoverFeed").mockResolvedValue({
      groups: [
        {
          id: "frontend-forge",
          name: "Frontend Forge",
          description: "UI systems and accessibility.",
          memberCount: 9840,
          isJoined: false,
          imageUrl: "https://example.com/group.png",
        },
      ],
      events: [],
      trending: [],
      groupsError: null,
      eventsError: new Error("Unauthorized"),
    });

    const { result } = renderHook(() => useDiscoverFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data.isLoading).toBe(false);
    });

    expect(result.current.feed.groups).toHaveLength(1);
    expect(result.current.data.sections[1]?.error).toMatch(/unauthorized/i);
    expect(result.current.error).toBeNull();
  });

  it("builds a section-based discover contract with independent section errors", () => {
    const contract = createDiscoverPageData(
      {
        groups: [
          {
            id: "frontend-forge",
            name: "Frontend Forge",
            description: "UI systems and accessibility.",
            memberCount: 9840,
            isJoined: false,
            imageUrl: "https://example.com/group.png",
          },
        ],
        events: [],
        trending: [],
      },
      {
        isLoading: false,
        groupsError: null,
        eventsError: new Error("Unauthorized"),
      },
    );

    expect(contract.sections).toHaveLength(2);
    expect(contract.sections[0]).toMatchObject({
      type: "groups",
      isEmpty: false,
      error: null,
    });
    expect(contract.sections[1]).toMatchObject({
      type: "events",
      isEmpty: true,
      error: "Unauthorized",
    });
    expect(contract.hasAnyContent).toBe(true);
    expect(contract.hasAnyError).toBe(true);
  });
});
