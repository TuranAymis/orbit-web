import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { DiscoverPage } from "@/pages/discover/DiscoverPage";
import type { Group } from "@/entities/group/model/types";
import type { EventListItem } from "@/entities/event/model/types";
import * as useDiscoverFeedModule from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import type { DiscoverPageData } from "@/features/discover/get-discover-feed/model/discoverPageData";

const mockGroups: Group[] = [
  {
    id: "frontend-forge",
    name: "Frontend Forge",
    description: "Craft fast interfaces with React, TypeScript, and a strong design system practice.",
    memberCount: 9840,
    isJoined: false,
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
];

const mockEvents: EventListItem[] = [
  {
    id: "design-systems-review",
    title: "Design Systems Review",
    description: "Review component APIs, token changes, and release notes.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    startsAt: "2026-04-08T18:00:00.000Z",
    endsAt: "2026-04-08T19:00:00.000Z",
    location: "Orbit Live Room",
    attendeeCount: 184,
    isJoined: true,
    category: "Workshop",
  },
];

function createDiscoverPageDataMock(overrides?: Partial<DiscoverPageData>): DiscoverPageData {
  return {
    sections: [
      {
        type: "groups",
        title: "Groups For You",
        description: "Communities pulled from the live Orbit backend.",
        items: mockGroups,
        error: null,
        isEmpty: false,
      },
      {
        type: "events",
        title: "Events For You",
        description: "Upcoming sessions and live gatherings from the backend feed.",
        items: mockEvents,
        error: null,
        isEmpty: false,
      },
    ],
    isLoading: false,
    hasAnyContent: true,
    hasAnyError: false,
    ...overrides,
  };
}

function renderDiscoverPage() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders real feed data in the groups tab", () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock(),
      error: null,
      feed: {
        groups: mockGroups,
        events: mockEvents,
        trending: [],
      },
      refetch: vi.fn(),
    });

    renderDiscoverPage();

    expect(screen.getByRole("heading", { name: /discover communities/i })).toBeInTheDocument();
    expect(screen.getByText(/frontend forge/i)).toBeInTheDocument();
  });

  it("switches to the events tab and renders event cards", async () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock(),
      error: null,
      feed: {
        groups: mockGroups,
        events: mockEvents,
        trending: [],
      },
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    await user.click(screen.getByRole("tab", { name: /events/i }));

    expect(screen.getByRole("tab", { name: /events/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/design systems review/i)).toBeInTheDocument();
  });

  it("switches to the trending tab and renders section-based trending content", async () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock(),
      error: null,
      feed: {
        groups: mockGroups,
        events: mockEvents,
        trending: [],
      },
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    await user.click(screen.getByRole("tab", { name: /trending/i }));

    expect(screen.getByText(/trending groups/i)).toBeInTheDocument();
    expect(screen.getByText(/trending events/i)).toBeInTheDocument();
  });

  it("renders section-aware loading skeletons while the discover feed is fetching", () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock({
        sections: [],
        isLoading: true,
        hasAnyContent: false,
        hasAnyError: false,
      }),
      error: null,
      feed: {
        groups: [],
        events: [],
        trending: [],
      },
      refetch: vi.fn(),
    });

    renderDiscoverPage();

    expect(screen.getByTestId("discover-loading")).toBeInTheDocument();
    expect(screen.getAllByTestId("discover-section-skeleton")).toHaveLength(2);
  });

  it("renders an error state with retry", async () => {
    const refetch = vi.fn();
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock({
        sections: [],
        isLoading: false,
        hasAnyContent: false,
        hasAnyError: false,
      }),
      error: new Error("Network error"),
      feed: {
        groups: [],
        events: [],
        trending: [],
      },
      refetch,
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    expect(screen.getByText(/we couldn't load discover right now/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it("renders page-level empty state only when every section is empty", async () => {
    const refetch = vi.fn();
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock({
        sections: [
          {
            type: "groups",
            title: "Groups For You",
            description: "Communities pulled from the live Orbit backend.",
            items: [],
            error: null,
            isEmpty: true,
          },
          {
            type: "events",
            title: "Events For You",
            description: "Upcoming sessions and live gatherings from the backend feed.",
            items: [],
            error: null,
            isEmpty: true,
          },
        ],
        isLoading: false,
        hasAnyContent: false,
        hasAnyError: false,
      }),
      error: null,
      feed: {
        groups: [],
        events: [],
        trending: [],
      },
      refetch,
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    expect(screen.getByText(/discover is quiet right now/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /refresh feed/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it("keeps groups visible when the events section fails", async () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      data: createDiscoverPageDataMock({
        sections: [
          {
            type: "groups",
            title: "Groups For You",
            description: "Communities pulled from the live Orbit backend.",
            items: mockGroups,
            error: null,
            isEmpty: false,
          },
          {
            type: "events",
            title: "Events For You",
            description: "Upcoming sessions and live gatherings from the backend feed.",
            items: [],
            error: "Unauthorized",
            isEmpty: true,
          },
        ],
        hasAnyContent: true,
        hasAnyError: true,
      }),
      error: null,
      feed: {
        groups: mockGroups,
        events: [],
        trending: [],
      },
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    expect(screen.getByText(/frontend forge/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /events/i }));

    expect(screen.getByText(/we couldn't load events right now/i)).toBeInTheDocument();
  });
});
