import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { EventDetailPage } from "@/pages/events/EventDetailPage";
import * as getEventDetailApi from "@/features/events/get-event-detail/api/getEventDetail";
import type { AuthSession } from "@/features/auth/types";

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

function renderEventDetail(initialPath = "/events/design-systems-review") {
  return render(
    <AppProviders initialSession={demoSession}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/events/:eventId" element={<EventDetailPage />} />
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
});
