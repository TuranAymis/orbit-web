import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { GroupDetailPage } from "@/pages/groups/GroupDetailPage";
import type { AuthSession } from "@/features/auth/types";
import * as groupDetailApi from "@/features/groups/get-group-detail/api/getGroupDetail";

const demoSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    avatarFallback: "DO",
  },
};

const groupPayload = {
  id: "frontend-forge",
  name: "Frontend Forge",
  description:
    "Build accessible, production-ready interfaces with React, TypeScript, and high-signal feedback loops.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  memberCount: 9840,
  isJoined: true,
  category: "Engineering",
  location: "Remote-first",
  founder: "Annie Case",
  stats: {
    weeklyPosts: 42,
    activeMembers: 684,
    upcomingEvents: 3,
  },
  upcomingEvents: [
    {
      id: "evt_1",
      title: "Design Systems Review",
      startsAt: "2026-04-08T18:00:00.000Z",
      location: "Orbit Live Room",
    },
  ],
  galleryPreview: [
    {
      id: "gal_1",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      alt: "Developers collaborating on interface systems",
    },
  ],
  memberPreview: [
    {
      id: "mem_1",
      name: "Annie Case",
      avatarFallback: "AC",
      role: "Founder",
    },
    {
      id: "mem_2",
      name: "Eli Turner",
      avatarFallback: "ET",
      role: "Moderator",
    },
  ],
};

function renderGroupDetail(initialPath = "/groups/frontend-forge") {
  return render(
    <AppProviders initialSession={demoSession}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("GroupDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the route param to load group detail and renders mapped data", async () => {
    const spy = vi
      .spyOn(groupDetailApi, "getGroupDetail")
      .mockResolvedValue(groupPayload as never);

    renderGroupDetail("/groups/frontend-forge");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /frontend forge/i })).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledWith("frontend-forge");
    expect(screen.getByText(/engineering/i)).toBeInTheDocument();
    expect(screen.getAllByText(/remote-first/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /leave group/i })).toBeInTheDocument();
  });

  it("renders loading skeletons while fetching", () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockImplementation(
      () => new Promise(() => {}),
    );

    renderGroupDetail();

    expect(screen.getByTestId("group-detail-loading")).toBeInTheDocument();
  });

  it("renders an error state and retries loading", async () => {
    const spy = vi
      .spyOn(groupDetailApi, "getGroupDetail")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(groupPayload as never);
    const user = userEvent.setup();

    renderGroupDetail();

    expect(
      await screen.findByText(/we couldn't load this group right now/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /frontend forge/i })).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("switches tabs and renders the selected panel", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);
    const user = userEvent.setup();

    renderGroupDetail();

    await screen.findByRole("heading", { name: /frontend forge/i });
    await user.click(screen.getByRole("tab", { name: /gallery/i }));

    expect(screen.getByRole("tab", { name: /gallery/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText(/community snapshots/i)).toBeInTheDocument();
  });

  it("renders join button when the user has not joined the group", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue({
      ...groupPayload,
      isJoined: false,
    } as never);

    renderGroupDetail();

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(screen.getByRole("button", { name: /join group/i })).toBeInTheDocument();
  });
});
