import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { GroupDetailPage } from "@/pages/groups/GroupDetailPage";
import type { AuthSession, OrbitUserRole } from "@/features/auth/types";
import * as deleteGroupApi from "@/features/groups/delete-group/api/deleteGroup";
import * as groupDetailApi from "@/features/groups/get-group-detail/api/getGroupDetail";

function createSession(role: OrbitUserRole = "user"): AuthSession {
  return {
    isAuthenticated: true,
    accessToken: "test-access-token",
    tokenType: "bearer",
    expiresIn: 3600,
    user: {
      id: `user_${role}`,
      name: `${role} orbit`,
      email: `${role}@orbit.dev`,
      membershipTier: "Core",
      role,
      avatarFallback: role.slice(0, 2).toUpperCase(),
    },
  };
}

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

function renderGroupDetail(
  initialPath = "/groups/frontend-forge",
  session: AuthSession = createSession(),
) {
  return render(
    <AppProviders initialSession={session}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/groups" element={<div>Groups route</div>} />
          <Route path="/events/:eventId" element={<div>Event detail route</div>} />
          <Route path="/chat" element={<div>Group chat route</div>} />
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
    expect(screen.getAllByText(/engineering/i).length).toBeGreaterThan(0);
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

  it("renders about tab details from real group information", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);

    renderGroupDetail();

    await screen.findByRole("heading", { name: /frontend forge/i });

    expect(screen.getByText(/community summary/i)).toBeInTheDocument();
    expect(screen.getAllByText(/annie case/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/9,840/i).length).toBeGreaterThan(0);
  });

  it("renders event links in the events tab", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);
    const user = userEvent.setup();

    renderGroupDetail();

    await screen.findByRole("heading", { name: /frontend forge/i });
    await user.click(screen.getByRole("tab", { name: /events/i }));
    await user.click(screen.getByRole("link", { name: /design systems review/i }));

    expect(screen.getByText(/event detail route/i)).toBeInTheDocument();
  });

  it("renders empty states for events and gallery when no data exists", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue({
      ...groupPayload,
      upcomingEvents: [],
      galleryPreview: [],
    } as never);
    const user = userEvent.setup();

    renderGroupDetail();

    await screen.findByRole("heading", { name: /frontend forge/i });

    await user.click(screen.getByRole("tab", { name: /events/i }));
    expect(screen.getByText(/no upcoming group events yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /gallery/i }));
    expect(screen.getByText(/no gallery items yet/i)).toBeInTheDocument();
  });

  it("renders the chat tab as a group-chat entry surface", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);
    const user = userEvent.setup();

    renderGroupDetail("/groups/frontend-forge?tab=chat");

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(screen.getByRole("tab", { name: /chat/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/community pulse/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /open group chat/i }));

    expect(screen.getByText(/group chat route/i)).toBeInTheDocument();
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

  it("shows the create event action for moderators and admins", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);

    renderGroupDetail("/groups/frontend-forge", createSession("moderator"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(screen.getByRole("link", { name: /create event for this group/i })).toHaveAttribute(
      "href",
      "/events/create?groupId=frontend-forge",
    );
  });

  it("hides the create event action for regular users", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);

    renderGroupDetail("/groups/frontend-forge", createSession("user"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(
      screen.queryByRole("link", { name: /create event for this group/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the delete group action for admins only", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);

    renderGroupDetail("/groups/frontend-forge", createSession("admin"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(screen.getByRole("button", { name: /delete group/i })).toBeInTheDocument();
  });

  it("hides the delete group action for moderators", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);

    renderGroupDetail("/groups/frontend-forge", createSession("moderator"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    expect(screen.queryByRole("button", { name: /delete group/i })).not.toBeInTheDocument();
  });

  it("opens a confirmation state before deleting the group", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);
    const user = userEvent.setup();

    renderGroupDetail("/groups/frontend-forge", createSession("admin"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    await user.click(screen.getByRole("button", { name: /delete group/i }));

    const confirmCard = screen.getByRole("alertdialog", { name: /delete this group\?/i });

    expect(within(confirmCard).getByRole("button", { name: /^delete group$/i })).toBeInTheDocument();
  });

  it("surfaces delete permission errors without crashing", async () => {
    vi.spyOn(groupDetailApi, "getGroupDetail").mockResolvedValue(groupPayload as never);
    vi.spyOn(deleteGroupApi, "deleteGroup").mockRejectedValue(
      new Error("Only admins can delete groups"),
    );
    const user = userEvent.setup();

    renderGroupDetail("/groups/frontend-forge", createSession("admin"));

    await screen.findByRole("heading", { name: /frontend forge/i });
    await user.click(screen.getByRole("button", { name: /delete group/i }));
    const confirmCard = screen.getByRole("alertdialog", { name: /delete this group\?/i });

    await user.click(
      within(confirmCard).getByRole("button", { name: /^delete group$/i }),
    );

    expect(await screen.findByText(/only admins can delete groups/i)).toBeInTheDocument();
  });
});
