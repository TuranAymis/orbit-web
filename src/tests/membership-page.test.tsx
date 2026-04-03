import { render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { MembershipPage } from "@/pages/membership/MembershipPage";
import * as membershipApi from "@/features/membership/get-membership/api/getCurrentMembership";
import * as upgradeMembershipModule from "@/features/membership/upgrade-membership/model/useUpgradeMembership";

function renderMembershipPage() {
  return render(
    <AppProviders>
      <MemoryRouter>
        <MembershipPage />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("MembershipPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders mapped membership data and plan comparison", async () => {
    vi.spyOn(membershipApi, "getCurrentMembership").mockResolvedValue({
      tier: "free",
      status: "active",
      startedAt: "2026-03-01T12:00:00.000Z",
      renewsAt: "2026-05-01T12:00:00.000Z",
      benefits: ["Join public communities", "Basic chat"],
      limits: {
        groupJoinsPerMonth: 10,
        eventRsvpsPerMonth: 8,
        storageGb: 1,
      },
    });
    vi.spyOn(upgradeMembershipModule, "useUpgradeMembership").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderMembershipPage();

    await waitForElementToBeRemoved(() => screen.getByTestId("membership-loading"));

    expect(screen.getAllByText(/orbit free/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /upgrade to premium/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /^current plan$/i })).toBeDisabled();
  });

  it("renders the correct active and inactive plan CTA states", async () => {
    vi.spyOn(membershipApi, "getCurrentMembership").mockResolvedValue({
      tier: "premium",
      status: "active",
      startedAt: "2026-03-01T12:00:00.000Z",
      renewsAt: "2026-05-01T12:00:00.000Z",
      benefits: ["Priority support"],
      limits: {
        groupJoinsPerMonth: null,
        eventRsvpsPerMonth: null,
        storageGb: 50,
      },
    });
    vi.spyOn(upgradeMembershipModule, "useUpgradeMembership").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderMembershipPage();

    await waitForElementToBeRemoved(() => screen.getByTestId("membership-loading"));

    const currentPlanButtons = screen.getAllByRole("button", { name: /^current plan$/i });
    expect(currentPlanButtons).toHaveLength(1);
    expect(currentPlanButtons[0]).toBeDisabled();
    expect(screen.getByRole("button", { name: /free plan/i })).toBeDisabled();
  });

  it("renders loading state while membership is fetching", () => {
    vi.spyOn(membershipApi, "getCurrentMembership").mockImplementation(
      () => new Promise(() => {}),
    );
    vi.spyOn(upgradeMembershipModule, "useUpgradeMembership").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderMembershipPage();

    expect(screen.getByTestId("membership-loading")).toBeInTheDocument();
  });

  it("renders an error state with retry", async () => {
    const spy = vi
      .spyOn(membershipApi, "getCurrentMembership")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        tier: "premium",
        status: "active",
        startedAt: "2026-03-01T12:00:00.000Z",
        renewsAt: "2026-05-01T12:00:00.000Z",
        benefits: ["Priority support"],
        limits: {
          groupJoinsPerMonth: null,
          eventRsvpsPerMonth: null,
          storageGb: 50,
        },
      });
    vi.spyOn(upgradeMembershipModule, "useUpgradeMembership").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    const user = userEvent.setup();

    renderMembershipPage();

    expect(
      await screen.findByText(/we couldn't load your membership right now/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /premium orbit/i })).toBeInTheDocument();
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
