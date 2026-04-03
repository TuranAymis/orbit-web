import { createElement } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { useDiscoverFeed } from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import * as discoverApi from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(AppProviders, { queryClient }, children);
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
    });

    const { result } = renderHook(() => useDiscoverFeed(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groups[0]?.name).toBe("Frontend Forge");
    expect(result.current.events[0]?.title).toBe("Design Systems Review");
    expect(result.current.trending[0]?.metricLabel).toBe("Momentum");
    expect(result.current.isEmpty).toBe(false);
  });
});
