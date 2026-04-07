import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrbitAuthError } from "@/features/auth/auth-service";
import * as useAuthModule from "@/features/auth/useAuth";
import { LoginPage } from "@/pages/auth/LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a verification shortcut when login fails because the account is inactive", async () => {
    const login = vi
      .fn()
      .mockRejectedValue(
        new OrbitAuthError(
          "Your account is not active yet. Please verify your email before logging in.",
          "inactive_account",
        ),
      );

    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      login,
      logout: vi.fn(),
      session: null,
      user: null,
      role: null,
      authReady: true,
      isLoading: false,
      isAuthenticated: false,
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/email/i), "pending@orbit.dev");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /continue to orbit/i }));

    expect(
      await screen.findByText(/your account is not active yet\. please verify your email before logging in\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /verify your email/i })).toHaveAttribute(
      "href",
      "/verify-account?email=pending%40orbit.dev",
    );
  });

  it("shows the verified success banner and sign-in CTA when redirected from verification", () => {
    vi.spyOn(useAuthModule, "useAuth").mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      session: null,
      user: null,
      role: null,
      authReady: true,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={["/login?email=user@orbit.dev&verified=1"]}>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/your account has been verified\. you can now log in\./i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("user@orbit.dev");
  });
});
