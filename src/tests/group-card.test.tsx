import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GroupCard } from "@/entities/group/ui/GroupCard";
import type { Group } from "@/entities/group/model/types";

const group: Group = {
  id: "grp_oss",
  name: "Open Source Orbit",
  description: "Build tools, ship libraries, and review community-driven code together.",
  memberCount: 12480,
  imageUrl:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
};

describe("GroupCard", () => {
  it("renders the group image, content, member count, and join action", () => {
    render(<GroupCard group={group} />);

    expect(screen.getByRole("img", { name: /open source orbit/i })).toHaveAttribute(
      "src",
      group.imageUrl,
    );
    expect(screen.getByRole("heading", { name: /open source orbit/i })).toBeInTheDocument();
    expect(
      screen.getByText(/build tools, ship libraries, and review community-driven code together/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/12,480 members/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /join group/i })).toBeInTheDocument();
  });
});
