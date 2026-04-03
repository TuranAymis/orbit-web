import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { routes } from "@/app/router/routes";
import type { AuthSession } from "@/features/auth/types";

const demoSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    avatarFallback: "DO",
  },
};

function renderApp(initialEntry: string, session?: AuthSession | null) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  return {
    user: userEvent.setup(),
    router,
    ...render(
      <AppProviders initialSession={session ?? null}>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}

describe("Orbit auth routing", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("redirects unauthenticated users from protected routes to login", async () => {
    renderApp("/discover");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /welcome back to orbit/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("navigation", { name: /primary/i })).not.toBeInTheDocument();
  });

  it("allows authenticated users to access protected pages", async () => {
    renderApp("/discover", demoSession);

    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /discover communities/i })).toBeInTheDocument();
  });

  it("redirects authenticated users away from login to discover", async () => {
    renderApp("/login", demoSession);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /discover communities/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("heading", { name: /welcome back to orbit/i })).not.toBeInTheDocument();
  });

  it("logs in with valid mock credentials and redirects to discover", async () => {
    const { user } = renderApp("/login");

    await user.type(screen.getByLabelText(/email/i), "demo@orbit.dev");
    await user.type(screen.getByLabelText(/password/i), "orbit123");
    await user.click(screen.getByRole("button", { name: /continue to orbit/i }));

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /discover communities/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/demo orbit/i)).toBeInTheDocument();
    expect(screen.getByText(/demo@orbit\.dev/i)).toBeInTheDocument();
  });

  it("shows an error for invalid mock credentials", async () => {
    const { user } = renderApp("/login");

    await user.type(screen.getByLabelText(/email/i), "wrong@orbit.dev");
    await user.type(screen.getByLabelText(/password/i), "invalid");
    await user.click(screen.getByRole("button", { name: /continue to orbit/i }));

    expect(
      await screen.findByText(/use demo@orbit\.dev and orbit123 to sign in/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /welcome back to orbit/i })).toBeInTheDocument();
  });

  it("logs out, clears the session, and returns the user to login", async () => {
    const { user } = renderApp("/discover", demoSession);

    await user.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /welcome back to orbit/i }),
      ).toBeInTheDocument();
    });

    expect(screen.queryByRole("navigation", { name: /primary/i })).not.toBeInTheDocument();
  });

  it("renders authenticated user data in the shell", () => {
    renderApp("/membership", demoSession);

    expect(screen.getByText(/demo orbit/i)).toBeInTheDocument();
    expect(screen.getByText(/core member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profile menu/i)).toHaveTextContent("DO");
  });
});
