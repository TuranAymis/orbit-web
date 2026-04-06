import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { GroupGrid } from "@/features/groups/list-groups/ui/GroupGrid";
import type { Group } from "@/entities/group/model/types";

const groups: Group[] = [
  {
    id: "grp_design",
    name: "Design Systems Guild",
    description: "Scale design tokens, component APIs, and UI governance patterns.",
    memberCount: 8350,
    isJoined: false,
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "grp_ai",
    name: "AI Builders Circle",
    description: "Prototype assistants, eval workflows, and shipping-ready AI features.",
    memberCount: 14320,
    isJoined: false,
    imageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80",
  },
];

describe("GroupGrid", () => {
  it("renders a responsive grid of group cards", () => {
    const { container } = render(
      <MemoryRouter>
        <GroupGrid groups={groups} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /design systems guild/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ai builders circle/i })).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      "grid",
      "grid-cols-1",
      "lg:grid-cols-3",
      "2xl:grid-cols-4",
    );
  });

  it("renders an empty state when no groups are available", () => {
    render(
      <MemoryRouter>
        <GroupGrid groups={[]} isEmpty />
      </MemoryRouter>,
    );

    expect(screen.getByText(/no groups found yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/try another tab or check back for fresh communities soon/i),
    ).toBeInTheDocument();
  });

  it("renders loading skeleton cards while groups are loading", () => {
    render(
      <MemoryRouter>
        <GroupGrid groups={[]} isLoading />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("group-grid-skeleton")).toBeInTheDocument();
  });
});
