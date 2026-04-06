import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
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
    render(
      <MemoryRouter>
        <GroupCard group={group} />
      </MemoryRouter>,
    );

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

  it("calls the provided join handler with the group id", async () => {
    const user = userEvent.setup();
    const onJoinGroup = vi.fn();

    render(
      <MemoryRouter>
        <GroupCard group={group} onJoinGroup={onJoinGroup} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /join group/i }));

    expect(onJoinGroup).toHaveBeenCalledWith(group.id);
  });

  it("navigates to the group detail route when the card link is activated", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/groups"]}>
        <Routes>
          <Route path="/groups" element={<GroupCard group={group} />} />
          <Route path="/groups/:groupId" element={<div>Group detail page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: /open open source orbit/i }));

    expect(screen.getByText(/group detail page/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation to the group detail route", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/groups"]}>
        <Routes>
          <Route path="/groups" element={<GroupCard group={group} />} />
          <Route path="/groups/:groupId" element={<div>Group detail page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.tab();
    await user.keyboard("{Enter}");

    expect(screen.getByText(/group detail page/i)).toBeInTheDocument();
  });
});
