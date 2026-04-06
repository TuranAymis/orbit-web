import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { EventDetailPage } from "@/pages/events/EventDetailPage";
import type { OrbitUserRole, AuthSession } from "@/features/auth/types";
import * as deleteEventApi from "@/features/events/delete-event/api/deleteEvent";
import * as getEventDetailApi from "@/features/events/get-event-detail/api/getEventDetail";
import * as joinEventApi from "@/features/events/join-event/api/joinEvent";

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

const eventPayload = {
  id: "design-systems-review",
  title: "Design Systems Review",
  description:
    "Review token changes, component API consistency, and upcoming release notes.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  startsAt: "2026-04-08T18:00:00.000Z",
  endsAt: "2026-04-08T19:30:00.000Z",
  location: "Orbit Live Room",
  attendeeCount: 184,
  isJoined: false,
  category: "Workshop",
  host: "Annie Case",
  relatedGroup: {
    id: "frontend-forge",
    name: "Frontend Forge",
    description: "Frontend systems, accessibility, and production UI craft.",
  },
  participantsPreview: [
    {
      id: "mem_1",
      name: "Eli Turner",
      avatarFallback: "ET",
      role: "Moderator",
    },
  ],
};

function renderEventDetail(
  initialPath = "/events/design-systems-review",
  session: AuthSession = createSession(),
) {
  return render(
    <AppProviders initialSession={session}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
          <Route path="/events" element={<div>Events route</div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the route param to load event detail and render mapped data", async () => {
    const spy = vi
      .spyOn(getEventDetailApi, "getEventDetail")
      .mockResolvedValue(eventPayload as never);

    renderEventDetail();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /design systems review/i }),
      ).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledWith("design-systems-review");
    expect(screen.getByText(/orbit live room/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join event/i })).toBeInTheDocument();
  });

  it("renders loading state while fetching", () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockImplementation(
      () => new Promise(() => {}),
    );

    renderEventDetail();

    expect(screen.getByTestId("event-detail-loading")).toBeInTheDocument();
  });

  it("renders an error state with retry", async () => {
    const spy = vi
      .spyOn(getEventDetailApi, "getEventDetail")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(eventPayload as never);
    const user = userEvent.setup();

    renderEventDetail();

    expect(await screen.findByText(/we couldn't load this event right now/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /design systems review/i }),
      ).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("renders leave button when the user already joined", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue({
      ...eventPayload,
      isJoined: true,
    } as never);

    renderEventDetail();

    await screen.findByRole("heading", { name: /design systems review/i });
    expect(screen.getByRole("button", { name: /leave event/i })).toBeInTheDocument();
  });

  it("updates the attendee count and button label after joining", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail")
      .mockResolvedValueOnce(eventPayload as never)
      .mockResolvedValue({
        ...eventPayload,
        isJoined: true,
        attendeeCount: eventPayload.attendeeCount + 1,
      } as never);
    vi.spyOn(joinEventApi, "joinEvent").mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderEventDetail();

    await screen.findByRole("heading", { name: /design systems review/i });
    await user.click(screen.getByRole("button", { name: /join event/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /leave event/i })).toBeInTheDocument();
      expect(screen.getAllByText(/185 attendees/i).length).toBeGreaterThan(0);
    });
  });

  it("shows the delete event action for moderators", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);

    renderEventDetail("/events/design-systems-review", createSession("moderator"));

    await screen.findByRole("heading", { name: /design systems review/i });
    expect(screen.getByRole("button", { name: /delete event/i })).toBeInTheDocument();
  });

  it("hides the delete event action for regular users", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);

    renderEventDetail("/events/design-systems-review", createSession("user"));

    await screen.findByRole("heading", { name: /design systems review/i });
    expect(screen.queryByRole("button", { name: /delete event/i })).not.toBeInTheDocument();
  });

  it("opens a confirmation state before deleting the event", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);
    const user = userEvent.setup();

    renderEventDetail("/events/design-systems-review", createSession("admin"));

    await screen.findByRole("heading", { name: /design systems review/i });
    const deleteAction = screen.getByTestId("event-delete-action");

    await user.click(within(deleteAction).getByRole("button", { name: /delete event/i }));

    const confirmCard = within(deleteAction).getByRole("alertdialog", {
      name: /delete this event\?/i,
    });

    expect(within(confirmCard).getByRole("button", { name: /^delete event$/i })).toBeInTheDocument();
  });

  it("closes the local confirmation when cancel is clicked", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);
    const user = userEvent.setup();

    renderEventDetail("/events/design-systems-review", createSession("admin"));

    await screen.findByRole("heading", { name: /design systems review/i });
    const deleteAction = screen.getByTestId("event-delete-action");

    await user.click(within(deleteAction).getByRole("button", { name: /delete event/i }));
    await user.click(within(deleteAction).getByRole("button", { name: /cancel/i }));

    expect(within(deleteAction).queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("shows a loading state while the delete mutation is pending", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);
    vi.spyOn(deleteEventApi, "deleteEvent").mockImplementation(
      () => new Promise(() => {}),
    );
    const user = userEvent.setup();

    renderEventDetail("/events/design-systems-review", createSession("moderator"));

    await screen.findByRole("heading", { name: /design systems review/i });
    const deleteAction = screen.getByTestId("event-delete-action");

    await user.click(within(deleteAction).getByRole("button", { name: /delete event/i }));
    const confirmCard = within(deleteAction).getByRole("alertdialog", {
      name: /delete this event\?/i,
    });

    await user.click(within(confirmCard).getByRole("button", { name: /^delete event$/i }));

    expect(
      within(deleteAction).getByRole("button", { name: /deleting/i }),
    ).toBeDisabled();
  });

  it("surfaces delete permission errors without crashing", async () => {
    vi.spyOn(getEventDetailApi, "getEventDetail").mockResolvedValue(eventPayload as never);
    vi.spyOn(deleteEventApi, "deleteEvent").mockRejectedValue(
      new Error("You don't have permission to delete this event"),
    );
    const user = userEvent.setup();

    renderEventDetail("/events/design-systems-review", createSession("moderator"));

    await screen.findByRole("heading", { name: /design systems review/i });
    const deleteAction = screen.getByTestId("event-delete-action");

    await user.click(within(deleteAction).getByRole("button", { name: /delete event/i }));
    const confirmCard = within(deleteAction).getByRole("alertdialog", {
      name: /delete this event\?/i,
    });

    await user.click(
      within(confirmCard).getByRole("button", { name: /^delete event$/i }),
    );

    expect(
      await screen.findByText(/you don't have permission to delete this event/i),
    ).toBeInTheDocument();
  });
});
