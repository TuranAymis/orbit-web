import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as registerModule from "@/features/auth/register/model/useRegisterUser";
import * as verifyModule from "@/features/auth/verify/model/useVerifyUserEmail";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { VerifyAccountPage } from "@/pages/auth/VerifyAccountPage";

function renderRegisterPage() {
  return render(
    <AppProviders initialSession={null}>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-account" element={<VerifyAccountPage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(verifyModule, "useVerifyUserEmail").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
  });

  it("validates the email field before submit", async () => {
    vi.spyOn(registerModule, "useRegisterUser").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/^email$/i), "invalid-email");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/confirm password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText(/please enter a valid email address\./i),
    ).toBeInTheDocument();
  });

  it("shows a confirm password mismatch error", async () => {
    vi.spyOn(registerModule, "useRegisterUser").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/^email$/i), "user@orbit.dev");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/confirm password/i), "secret999");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/passwords do not match\./i)).toBeInTheDocument();
  });

  it("navigates to verify-account with the registered email on success", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ email: "new@orbit.dev" });
    vi.spyOn(registerModule, "useRegisterUser").mockReturnValue({
      mutateAsync,
      isPending: false,
      error: null,
    } as never);
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/^email$/i), "new@orbit.dev");
    await user.type(screen.getByLabelText(/^password$/i), "secret123");
    await user.type(screen.getByLabelText(/confirm password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /verify your account/i }),
      ).toBeInTheDocument();
    });

    expect(mutateAsync).toHaveBeenCalledWith({
      email: "new@orbit.dev",
      password: "secret123",
    });
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("new@orbit.dev");
    expect(
      screen.getByText(/we sent a verification code to your email\./i),
    ).toBeInTheDocument();
  });
});
