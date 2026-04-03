import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { EventsPage } from "@/pages/events/EventsPage";
import * as listEventsApi from "@/features/events/list-events/api/listEvents";

const eventsPayload = [
  {
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
    isJoined: true,
    category: "Workshop",
  },
];

function renderEventsPage() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <EventsPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("EventsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders mapped event cards from backend data", async () => {
    vi.spyOn(listEventsApi, "listEvents").mockResolvedValue(eventsPayload as never);

    renderEventsPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /design systems review/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/orbit live room/i)).toBeInTheDocument();
  });

  it("renders a loading state while fetching", () => {
    vi.spyOn(listEventsApi, "listEvents").mockImplementation(
      () => new Promise(() => {}),
    );

    renderEventsPage();

    expect(screen.getByTestId("events-loading")).toBeInTheDocument();
  });

  it("renders an empty state when no events are returned", async () => {
    vi.spyOn(listEventsApi, "listEvents").mockResolvedValue([] as never);

    renderEventsPage();

    expect(await screen.findByText(/no upcoming events right now/i)).toBeInTheDocument();
  });

  it("renders an error state with retry", async () => {
    const spy = vi
      .spyOn(listEventsApi, "listEvents")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(eventsPayload as never);
    const user = userEvent.setup();

    renderEventsPage();

    expect(await screen.findByText(/we couldn't load events right now/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /design systems review/i }),
      ).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
