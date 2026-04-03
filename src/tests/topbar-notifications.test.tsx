import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import * as markNotificationReadModule from "@/features/notifications/mark-notification-read/model/useMarkNotificationRead";
import * as notificationsModule from "@/features/notifications/list-notifications/model/useNotifications";
import * as unreadModule from "@/features/notifications/get-unread-count/model/useUnreadNotifications";
import { Topbar } from "@/widgets/app-shell/Topbar";

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

function renderTopbar() {
  return render(
    <AppProviders initialSession={demoSession}>
      <MemoryRouter>
        <Topbar onOpenSidebar={() => undefined} />
      </MemoryRouter>
    </AppProviders>,
  );
}

describe("Topbar notifications", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the unread badge and opens the notification panel", async () => {
    vi.spyOn(unreadModule, "useUnreadNotifications").mockReturnValue({
      unreadCount: 3,
      isLoading: false,
      error: null,
    });
    vi.spyOn(notificationsModule, "useNotifications").mockReturnValue({
      data: [
        {
          id: "notif_1",
          type: "event",
          title: "Event reminder",
          message: "Design Systems Review starts in 30 minutes.",
          createdAt: "2026-04-03T10:00:00.000Z",
          isRead: false,
          relatedEntityType: "event",
          relatedEntityId: "design-systems-review",
          actor: {
            id: "user_1",
            name: "Annie Case",
            avatarFallback: "AC",
          },
          actionUrl: "/events/design-systems-review",
        },
      ],
      isLoading: false,
      error: null,
      isEmpty: false,
      refetch: vi.fn(),
    });
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(markNotificationReadModule, "useMarkNotificationRead").mockReturnValue({
      mutateAsync,
      isPending: false,
      reset: vi.fn(),
      status: "idle",
      variables: undefined,
      data: undefined,
      error: null,
      failureCount: 0,
      failureReason: null,
      isError: false,
      isIdle: true,
      isPaused: false,
      isSuccess: false,
      mutate: vi.fn(),
      submittedAt: 0,
      context: undefined,
    } as never);

    const user = userEvent.setup();
    renderTopbar();

    expect(screen.getByLabelText(/3 unread notifications/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText(/event reminder/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /event reminder/i }));

    expect(mutateAsync).toHaveBeenCalledWith("notif_1");
  });

  it("renders empty state in the notification panel", async () => {
    vi.spyOn(unreadModule, "useUnreadNotifications").mockReturnValue({
      unreadCount: 0,
      isLoading: false,
      error: null,
    });
    vi.spyOn(notificationsModule, "useNotifications").mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isEmpty: true,
      refetch: vi.fn(),
    });
    vi.spyOn(markNotificationReadModule, "useMarkNotificationRead").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    const user = userEvent.setup();
    renderTopbar();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
  });

  it("renders error state in the notification panel", async () => {
    const refetch = vi.fn();
    vi.spyOn(unreadModule, "useUnreadNotifications").mockReturnValue({
      unreadCount: 2,
      isLoading: false,
      error: null,
    });
    vi.spyOn(notificationsModule, "useNotifications").mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Network error"),
      isEmpty: false,
      refetch,
    });
    vi.spyOn(markNotificationReadModule, "useMarkNotificationRead").mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    const user = userEvent.setup();
    renderTopbar();

    await user.click(screen.getByRole("button", { name: /notifications/i }));

    expect(screen.getByText(/we couldn't load notifications/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(refetch).toHaveBeenCalled();
  });
});
