import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { EventCard } from "@/entities/event/ui/EventCard";
import type { EventListItem } from "@/entities/event/model/types";

const event: EventListItem = {
  id: "design-systems-review",
  title: "Design Systems Review",
  description: "Review token changes, component API consistency, and upcoming release notes.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  startsAt: "2026-04-08T18:00:00.000Z",
  endsAt: "2026-04-08T19:30:00.000Z",
  location: "Orbit Live Room",
  attendeeCount: 184,
  isJoined: true,
  category: "Workshop",
};

describe("EventCard", () => {
  it("renders event content and membership state", () => {
    render(
      <MemoryRouter>
        <EventCard event={event} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /design systems review/i })).toBeInTheDocument();
    expect(screen.getByText(/orbit live room/i)).toBeInTheDocument();
    expect(screen.getByText(/184 attendees/i)).toBeInTheDocument();
    expect(screen.getByText(/joined/i)).toBeInTheDocument();
  });
});
