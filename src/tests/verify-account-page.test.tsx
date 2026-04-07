import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as resendModule from "@/features/auth/resend-verification-code/model/useResendVerificationCode";
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
    vi.spyOn(resendModule, "useResendVerificationCode").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
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
      screen.getByText(/your account has been verified\. you can now log in\./i),
    ).toBeInTheDocument();
  });

  it("resends the verification code and shows a success message", async () => {
    vi.spyOn(verifyModule, "useVerifyUserEmail").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    const resendMutateAsync = vi.fn().mockResolvedValue({ email: "user@orbit.dev" });
    vi.spyOn(resendModule, "useResendVerificationCode").mockReturnValue({
      mutateAsync: resendMutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderVerifyAccountPage();

    await user.click(screen.getByRole("button", { name: /resend code/i }));

    expect(resendMutateAsync).toHaveBeenCalledWith({
      email: "user@orbit.dev",
    });
    expect(
      await screen.findByText(/a new verification code has been sent\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend in 30s/i })).toBeDisabled();
  });

  it("shows a graceful resend error when the backend route is unavailable", async () => {
    vi.spyOn(verifyModule, "useVerifyUserEmail").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.spyOn(resendModule, "useResendVerificationCode").mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockRejectedValue(
          new Error(
            "Resend verification is not available yet. Please use the latest code from your email.",
          ),
        ),
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderVerifyAccountPage();

    await user.click(screen.getByRole("button", { name: /resend code/i }));

    expect(
      await screen.findByText(/resend verification is not available yet\./i),
    ).toBeInTheDocument();
  });

  it("supports direct verify-page access without a prefilled email", () => {
    vi.spyOn(verifyModule, "useVerifyUserEmail").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderVerifyAccountPage("/verify-account");

    expect(screen.getByLabelText(/^email$/i)).toHaveValue("");
    expect(
      screen.getByText(
        /enter the email address you registered with, then paste the verification code from your inbox\./i,
      ),
    ).toBeInTheDocument();
  });
});
