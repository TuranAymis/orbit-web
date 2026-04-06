import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { Group } from "@/entities/group/model/types";
import type { AuthSession, OrbitUserRole } from "@/features/auth/types";
import * as createEventModule from "@/features/events/create-event/model/useCreateEvent";
import * as useGroupsModule from "@/features/groups/list-groups/model/useGroups";
import { CreateEventPage } from "@/pages/events/CreateEventPage";

const groups: Group[] = [
  {
    id: "frontend-forge",
    name: "Frontend Forge",
    description: "Frontend systems and accessible UI patterns.",
    memberCount: 1240,
    imageUrl: "https://example.com/group.png",
    isJoined: true,
  },
];

function createSession(role: OrbitUserRole): AuthSession {
  return {
    isAuthenticated: true,
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

function renderCreateEventPage(
  session: AuthSession,
  initialEntry = "/events/create?groupId=frontend-forge",
) {
  return render(
    <AppProviders initialSession={session}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events" element={<div>Events route</div>} />
          <Route path="/events/:eventId" element={<div>Created event route</div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("CreateEventPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(useGroupsModule, "useGroups").mockReturnValue({
      data: groups,
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });
  });

  it("renders a forbidden state for regular users", () => {
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderCreateEventPage(createSession("user"));

    expect(
      screen.getByText(/event creation requires moderator or admin access/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create event/i })).not.toBeInTheDocument();
  });

  it("submits through the create event hook and navigates on success", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "event_42" });
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderCreateEventPage(createSession("moderator"));

    expect(screen.getByLabelText(/group/i)).toHaveValue("frontend-forge");

    await user.type(screen.getByLabelText(/event title/i), "Orbit Review");
    await user.type(screen.getByLabelText(/location/i), "Orbit Live Room");
    await user.click(screen.getByRole("button", { name: /^create event$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: "frontend-forge",
          title: "Orbit Review",
          location: "Orbit Live Room",
        }),
      );
    });

    expect(screen.getByText(/created event route/i)).toBeInTheDocument();
  });
});
