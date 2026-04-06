import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { GroupsPage } from "@/pages/groups/GroupsPage";
import type { Group } from "@/entities/group/model/types";
import type { AuthSession, OrbitUserRole } from "@/features/auth/types";
import * as useGroupsModule from "@/features/groups/list-groups/model/useGroups";
import * as joinGroupApi from "@/features/groups/join-group/api/joinGroup";

const mockGroups: Group[] = [
  {
    id: "frontend-forge",
    name: "Frontend Forge",
    description: "Build accessible interfaces with React and TypeScript.",
    memberCount: 9840,
    imageUrl: "https://example.com/group-cover.png",
    isJoined: false,
  },
];

function createSession(role: OrbitUserRole): AuthSession {
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

function renderGroupsPage(session?: AuthSession | null) {
  return render(
    <AppProviders initialSession={session}>
      <MemoryRouter initialEntries={["/groups"]}>
        <Routes>
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<div>Group detail route</div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("GroupsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders mapped backend groups from the list hook", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderGroupsPage();

    expect(screen.getByRole("heading", { name: /groups workspace/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /frontend forge/i })).toBeInTheDocument();
    expect(screen.getByText(/9,840 members/i)).toBeInTheDocument();
  });

  it("shows the create group action only for admins", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderGroupsPage(createSession("admin"));

    expect(screen.getByRole("link", { name: /create group/i })).toBeInTheDocument();
  });

  it("hides the create group action for non-admins", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderGroupsPage(createSession("user"));

    expect(screen.queryByRole("link", { name: /create group/i })).not.toBeInTheDocument();
  });

  it("also hides the create group action for moderators", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });

    renderGroupsPage(createSession("moderator"));

    expect(screen.queryByRole("link", { name: /create group/i })).not.toBeInTheDocument();
  });

  it("renders the empty state only when the groups list is actually empty", () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isEmpty: true,
      refetch: vi.fn(),
    });

    renderGroupsPage();

    expect(screen.getByText(/no groups are available yet/i)).toBeInTheDocument();
  });

  it("retries loading the groups feed", async () => {
    const refetch = vi.fn();
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Network error"),
      isEmpty: false,
      refetch,
    });
    const user = userEvent.setup();

    renderGroupsPage();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it("navigates to group detail when a group card is clicked", async () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });
    const user = userEvent.setup();

    renderGroupsPage();

    await user.click(screen.getByRole("link", { name: /open frontend forge/i }));

    expect(screen.getByText(/group detail route/i)).toBeInTheDocument();
  });

  it("does not navigate when the join button is clicked", async () => {
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: mockGroups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });
    vi.spyOn(joinGroupApi, "joinGroup").mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderGroupsPage();

    await user.click(screen.getByRole("button", { name: /join group/i }));

    expect(screen.queryByText(/group detail route/i)).not.toBeInTheDocument();
  });
});
