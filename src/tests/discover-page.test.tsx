import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscoverPage } from "@/pages/discover/DiscoverPage";
import type { Group } from "@/entities/group/model/types";
import type { EventListItem } from "@/entities/event/model/types";
import * as useDiscoverFeedModule from "@/features/discover/get-discover-feed/model/useDiscoverFeed";

const mockGroups: Group[] = [
  {
    id: "frontend-forge",
    name: "Frontend Forge",
    description: "Craft fast interfaces with React, TypeScript, and a strong design system practice.",
    memberCount: 9840,
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

const mockTrending = [
  {
    id: "trend_frontend-forge",
    title: "Frontend Forge is trending",
    description: "Strong member growth and steady event participation this week.",
    metricLabel: "Momentum",
    metricValue: "High",
  },
];

function renderDiscoverPage() {
  return render(
    <MemoryRouter>
      <DiscoverPage />
    </MemoryRouter>,
  );
}

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders real feed data in the groups tab", () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      groups: mockGroups,
      events: mockEvents,
      trending: mockTrending,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderDiscoverPage();

    expect(screen.getByRole("heading", { name: /discover communities/i })).toBeInTheDocument();
    expect(screen.getByText(/frontend forge/i)).toBeInTheDocument();
  });

  it("switches to the events tab and renders event cards", async () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      groups: mockGroups,
      events: mockEvents,
      trending: mockTrending,
      isLoading: false,
      error: null,
      isEmpty: false,
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

  it("switches to the trending tab and renders normalized trending data", async () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      groups: mockGroups,
      events: mockEvents,
      trending: mockTrending,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    await user.click(screen.getByRole("tab", { name: /trending/i }));

    expect(screen.getByText(/frontend forge is trending/i)).toBeInTheDocument();
    expect(screen.getByText(/momentum/i)).toBeInTheDocument();
  });

  it("renders loading state while the discover feed is fetching", () => {
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      groups: [],
      events: [],
      trending: [],
      isLoading: true,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderDiscoverPage();

    expect(screen.getByTestId("discover-loading")).toBeInTheDocument();
  });

  it("renders an error state with retry", async () => {
    const refetch = vi.fn();
    vi.spyOn(useDiscoverFeedModule, "useDiscoverFeed").mockReturnValue({
      groups: [],
      events: [],
      trending: [],
      isLoading: false,
      error: new Error("Network error"),
      isEmpty: false,
      refetch,
    });

    const user = userEvent.setup();
    renderDiscoverPage();

    expect(screen.getByText(/we couldn't load discover right now/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(refetch).toHaveBeenCalled();
  });
});
