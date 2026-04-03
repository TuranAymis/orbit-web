import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "@/shared/lib/errors/AppErrorBoundary";
import { RouteErrorBoundary } from "@/shared/lib/errors/RouteErrorBoundary";

function ThrowingComponent(): JSX.Element {
  throw new Error("Boom");
}

describe("error boundaries", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the app-level fallback and resets cleanly", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary fallback={<div>App fallback</div>}>
        <ThrowingComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByText(/app fallback/i)).toBeInTheDocument();

    render(
      <AppErrorBoundary>
        <ThrowingComponent />
      </AppErrorBoundary>,
    );

    expect(screen.getByText(/orbit hit an unexpected error/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(screen.getByText(/orbit hit an unexpected error/i)).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("renders the route-level fallback and retries through the router", async () => {
    const user = userEvent.setup();
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error("Route loader failed"))
      .mockResolvedValueOnce(null);

    const router = createMemoryRouter(
      [
        {
          path: "/",
          loader,
          element: <div>Healthy route</div>,
          errorElement: <RouteErrorBoundary />,
        },
      ],
      {
        initialEntries: ["/"],
      },
    );

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByText(/this route is temporarily unavailable/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/route loader failed/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText(/healthy route/i)).toBeInTheDocument();
    });

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
