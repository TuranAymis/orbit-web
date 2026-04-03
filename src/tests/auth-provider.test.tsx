import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { AUTH_STORAGE_KEY } from "@/features/auth/auth-storage";
import { AuthError } from "@/features/auth/auth-service";
import type { AuthSession } from "@/features/auth/types";
import { useAuth } from "@/features/auth/useAuth";

const storedSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    avatarFallback: "DO",
  },
};

function AuthConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [error, setError] = React.useState("");

  return (
    <div>
      <p>{isLoading ? "loading" : "ready"}</p>
      <p>{isAuthenticated ? "authenticated" : "anonymous"}</p>
      <p>{user?.email ?? "no-user"}</p>
      <p>{error || "no-error"}</p>
      <button
        type="button"
        onClick={() => login({ email: "demo@orbit.dev", password: "orbit123" })}
      >
        login-success
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await login({ email: "wrong@orbit.dev", password: "invalid" });
          } catch (loginError) {
            if (loginError instanceof AuthError) {
              setError(loginError.message);
            }
          }
        }}
      >
        login-failure
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("restores a persisted session from localStorage", async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeInTheDocument();
    });

    expect(screen.getByText("authenticated")).toBeInTheDocument();
    expect(screen.getByText("demo@orbit.dev")).toBeInTheDocument();
  });

  it("logs in with the demo credentials and persists the session", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider initialSession={null}>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /login-success/i }));

    await waitFor(() => {
      expect(screen.getByText("authenticated")).toBeInTheDocument();
    });

    expect(screen.getByText("demo@orbit.dev")).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain("demo@orbit.dev");
  });

  it("surfaces login failures without storing a session", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider initialSession={null}>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: /login-failure/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/use demo@orbit\.dev and orbit123 to sign in/i),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("anonymous")).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("logs out and clears the persisted session", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider initialSession={storedSession}>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText("authenticated")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /logout/i }));

    expect(screen.getByText("anonymous")).toBeInTheDocument();
    expect(screen.getByText("no-user")).toBeInTheDocument();
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
