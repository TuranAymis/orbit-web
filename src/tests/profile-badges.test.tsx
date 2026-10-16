import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as badgesApi from "@/features/profile/badges/api/getBadges";
import { mapBadgeResponse } from "@/features/profile/badges/api/getBadges";
import { BadgeList } from "@/features/profile/badges/ui/BadgeList";

function renderBadges() {
  return render(<AppProviders><BadgeList /></AppProviders>);
}

describe("profile badges", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("maps backend timestamps to camelCase", () => {
    expect(mapBadgeResponse({
      key: "first_group_joined", title: "First group", description: "Join a group.",
      earned: true, awarded_at: "2026-04-01T10:00:00Z",
    })).toEqual({
      key: "first_group_joined", title: "First group", description: "Join a group.",
      earned: true, awardedAt: "2026-04-01T10:00:00Z",
    });
  });

  it("shows earned and locked badges", async () => {
    vi.spyOn(badgesApi, "getBadges").mockResolvedValue([
      { key: "first_group_joined", title: "First group", description: "Join a group.", earned: true, awardedAt: "2026-04-01T10:00:00Z" },
      { key: "first_event_joined", title: "First event", description: "Join an event.", earned: false, awardedAt: null },
    ]);
    renderBadges();
    expect(screen.getByTestId("badges-loading")).toBeInTheDocument();
    expect(await screen.findByText("First group")).toBeInTheDocument();
    expect(screen.getByText("First event")).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
  });

  it("shows empty and error states", async () => {
    vi.spyOn(badgesApi, "getBadges").mockResolvedValue([]);
    const view = renderBadges();
    expect(await screen.findByText("No badges are available yet.")).toBeInTheDocument();
    view.unmount();

    vi.spyOn(badgesApi, "getBadges").mockRejectedValue(new Error("offline"));
    renderBadges();
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't load your badges.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
