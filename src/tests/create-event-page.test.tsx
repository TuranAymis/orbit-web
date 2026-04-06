import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

  it("blocks base64 cover images before submit and shows an inline field error", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "event_42" });
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderCreateEventPage(createSession("moderator"));

    await user.type(screen.getByLabelText(/event title/i), "Orbit Review");
    await user.type(screen.getByLabelText(/location/i), "Orbit Live Room");
    await user.type(
      screen.getByLabelText(/cover image url/i),
      "data:image/png;base64,abc123",
    );
    await user.click(screen.getByRole("button", { name: /^create event$/i }));

    expect(
      screen.getByText(/please enter a valid image url\. base64 images are not supported\./i),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("blocks overly long cover image urls before submit and clears the error on edit", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "event_42" });
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderCreateEventPage(createSession("moderator"));

    await user.type(screen.getByLabelText(/event title/i), "Orbit Review");
    await user.type(screen.getByLabelText(/location/i), "Orbit Live Room");
    fireEvent.change(screen.getByLabelText(/cover image url/i), {
      target: { value: `https://example.com/${"a".repeat(2050)}` },
    });
    await user.click(screen.getByRole("button", { name: /^create event$/i }));

    expect(
      screen.getByText(/image url is too long\. maximum length is 2048 characters\./i),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/cover image url/i), {
      target: { value: "https://example.com/image.png" },
    });

    expect(
      screen.queryByText(/image url is too long\. maximum length is 2048 characters\./i),
    ).not.toBeInTheDocument();
  });

  it("allows a normal image url to pass validation", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "event_42" });
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderCreateEventPage(createSession("moderator"));

    await user.type(screen.getByLabelText(/event title/i), "Orbit Review");
    await user.type(screen.getByLabelText(/location/i), "Orbit Live Room");
    fireEvent.change(screen.getByLabelText(/cover image url/i), {
      target: { value: "https://example.com/image.png" },
    });
    await user.click(screen.getByRole("button", { name: /^create event$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          coverImageUrl: "https://example.com/image.png",
        }),
      );
    });
  });

  it("shows a friendly backend 422 validation message instead of raw error text", async () => {
    vi.spyOn(createEventModule, "useCreateEvent").mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(
        new Error("Image URL is too long. Please use a normal image link."),
      ),
      isPending: false,
      error: new Error("Image URL is too long. Please use a normal image link."),
    } as never);
    const user = userEvent.setup();

    renderCreateEventPage(createSession("moderator"));

    await user.type(screen.getByLabelText(/event title/i), "Orbit Review");
    await user.type(screen.getByLabelText(/location/i), "Orbit Live Room");
    await user.type(screen.getByLabelText(/cover image url/i), "https://example.com/image.png");
    await user.click(screen.getByRole("button", { name: /^create event$/i }));

    expect(
      await screen.findByText(/image url is too long\. please use a normal image link\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/string_too_long/i)).not.toBeInTheDocument();
  });
});
