import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as getProfileApi from "@/features/profile/get-profile/api/getProfile";
import * as updateProfileApi from "@/features/profile/update-profile/api/updateProfile";
import { ProfilePage } from "@/pages/profile/ProfilePage";

function renderProfilePage() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders mapped backend profile data", async () => {
    vi.spyOn(getProfileApi, "getProfile").mockResolvedValue({
      id: "user_demo",
      name: "Demo Orbit",
      email: "demo@orbit.dev",
      avatarUrl: null,
      bio: "Building communities with clear product systems.",
      location: "Istanbul",
      joinedAt: "2026-01-05T10:00:00.000Z",
      membershipTier: "Premium",
      stats: {
        groupsJoined: 14,
        eventsAttended: 6,
        messagesSent: 422,
      },
      activityPreview: [
        {
          id: "activity_1",
          title: "Hosted a frontend feedback session",
          description: "Shared notes and component improvements with the Frontend Forge group.",
          createdAt: "2026-04-02T15:00:00.000Z",
        },
      ],
    });

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /demo orbit/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/istanbul/i)).toBeInTheDocument();
    expect(screen.getByText(/hosted a frontend feedback session/i)).toBeInTheDocument();
  });

  it("renders loading and error states", async () => {
    vi.spyOn(getProfileApi, "getProfile").mockRejectedValue(new Error("Network error"));

    renderProfilePage();

    expect(screen.getByTestId("profile-loading")).toBeInTheDocument();
    expect(
      await screen.findByText(/we couldn't load your profile right now/i),
    ).toBeInTheDocument();
  });

  it("wires the profile update action", async () => {
    vi.spyOn(getProfileApi, "getProfile").mockResolvedValue({
      id: "user_demo",
      name: "Demo Orbit",
      email: "demo@orbit.dev",
      avatarUrl: null,
      bio: "Building communities with clear product systems.",
      location: "Istanbul",
      joinedAt: "2026-01-05T10:00:00.000Z",
      membershipTier: "Premium",
      stats: {
        groupsJoined: 14,
        eventsAttended: 6,
        messagesSent: 422,
      },
      activityPreview: [],
    });
    const updateSpy = vi
      .spyOn(updateProfileApi, "updateProfile")
      .mockResolvedValue(undefined);
    const user = userEvent.setup();

    renderProfilePage();

    await screen.findByDisplayValue("Demo Orbit");
    await user.clear(screen.getByDisplayValue("Demo Orbit"));
    await user.type(screen.getByLabelText(/name/i), "Orbit Builder");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith({
        name: "Orbit Builder",
        bio: "Building communities with clear product systems.",
        location: "Istanbul",
      }, expect.anything());
    });
  });
});
