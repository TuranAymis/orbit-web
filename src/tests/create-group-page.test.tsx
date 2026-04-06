import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession, OrbitUserRole } from "@/features/auth/types";
import { CreateGroupPage } from "@/pages/groups/CreateGroupPage";
import * as createGroupModule from "@/features/groups/create-group/model/useCreateGroup";

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

function renderCreateGroupPage(session: AuthSession) {
  return render(
    <AppProviders initialSession={session}>
      <MemoryRouter initialEntries={["/groups/create"]}>
        <Routes>
          <Route path="/groups/create" element={<CreateGroupPage />} />
          <Route path="/groups" element={<div>Groups route</div>} />
          <Route path="/groups/:groupId" element={<div>Created group route</div>} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("CreateGroupPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a forbidden state for non-admin users", () => {
    vi.spyOn(createGroupModule, "useCreateGroup").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderCreateGroupPage(createSession("user"));

    expect(screen.getByText(/group creation is limited to admins/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create group/i })).not.toBeInTheDocument();
  });

  it("submits through the create group hook and navigates on success", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "group_42" });
    vi.spyOn(createGroupModule, "useCreateGroup").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderCreateGroupPage(createSession("admin"));

    await user.type(screen.getByLabelText(/group name/i), "Orbit Builders");
    await user.click(screen.getByRole("button", { name: /^create group$/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Orbit Builders",
        }),
      );
    });

    expect(screen.getByText(/created group route/i)).toBeInTheDocument();
  });
});
