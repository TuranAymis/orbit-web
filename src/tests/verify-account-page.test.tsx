import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as verifyModule from "@/features/auth/verify/model/useVerifyUserEmail";
import { LoginPage } from "@/pages/auth/LoginPage";
import { VerifyAccountPage } from "@/pages/auth/VerifyAccountPage";

function renderVerifyAccountPage(initialEntry = "/verify-account?email=user@orbit.dev") {
  return render(
    <AppProviders initialSession={null}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/verify-account" element={<VerifyAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("VerifyAccountPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates back to login with a success message after verification", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ email: "user@orbit.dev" });
    vi.spyOn(verifyModule, "useVerifyUserEmail").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderVerifyAccountPage();

    expect(screen.getByLabelText(/^email$/i)).toHaveValue("user@orbit.dev");

    await user.type(screen.getByLabelText(/verification code/i), "123456");
    await user.click(screen.getByRole("button", { name: /verify account/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /welcome back to orbit/i }),
      ).toBeInTheDocument();
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      email: "user@orbit.dev",
      code: "123456",
    });
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("user@orbit.dev");
    expect(
      screen.getByText(/your account is active now\. sign in to continue\./i),
    ).toBeInTheDocument();
  });
});
