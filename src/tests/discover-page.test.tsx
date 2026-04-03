import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscoverPage } from "@/pages/discover/DiscoverPage";
import type { Group } from "@/entities/group/model/types";
import * as useGroupsModule from "@/features/groups/list-groups/model/useGroups";

const mockGroups: Group[] = [
  {
    id: "grp_frontend",
    name: "Frontend Forge",
    description: "Craft fast interfaces with modern React, TypeScript, and motion systems.",
    memberCount: 9840,
    imageUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_cloud",
    name: "Cloud Native Crew",
    description: "Trade notes on observability, containers, and platform engineering.",
    memberCount: 11450,
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
];

describe("DiscoverPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders groups from the list hook", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      isEmpty: false,
    });

    render(<DiscoverPage />);

    expect(screen.getByRole("heading", { name: /discover communities/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /groups/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/frontend forge/i)).toBeInTheDocument();
    expect(screen.getByText(/cloud native crew/i)).toBeInTheDocument();
  });

  it("switches the active tab in the UI", async () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      isEmpty: false,
    });

    const user = userEvent.setup();
    render(<DiscoverPage />);

    await user.click(screen.getByRole("tab", { name: /trending/i }));

    expect(screen.getByRole("tab", { name: /trending/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: /groups/i })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("shows an empty state when the hook returns no groups", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: [],
      isLoading: false,
      isEmpty: true,
    });

    render(<DiscoverPage />);

    expect(screen.getByText(/no groups found yet/i)).toBeInTheDocument();
  });
});
