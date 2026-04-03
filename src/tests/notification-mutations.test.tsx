import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { Notification } from "@/entities/notification/model/types";
import * as markNotificationReadApi from "@/features/notifications/mark-notification-read/api/markNotificationRead";
import { useMarkNotificationRead } from "@/features/notifications/mark-notification-read/model/useMarkNotificationRead";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders queryClient={queryClient}>{children}</AppProviders>;
  }

  return { queryClient, Wrapper };
}

describe("notification mutations", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("marks a notification as read and updates unread count cache", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const notifications: Notification[] = [
      {
        id: "notif_1",
        type: "event",
        title: "Event reminder",
        message: "Design Systems Review starts soon.",
        createdAt: "2026-04-03T10:00:00.000Z",
        isRead: false,
        relatedEntityType: "event",
        relatedEntityId: "design-systems-review",
        actor: null,
        actionUrl: null,
      },
    ];

    queryClient.setQueryData(orbitQueryKeys.notifications.all, notifications);
    queryClient.setQueryData(orbitQueryKeys.notifications.unreadCount, 1);
    vi.spyOn(markNotificationReadApi, "markNotificationRead").mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationRead(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync("notif_1");

    await waitFor(() => {
      expect(
        queryClient.getQueryData<Notification[]>(orbitQueryKeys.notifications.all)?.[0]?.isRead,
      ).toBe(true);
      expect(
        queryClient.getQueryData<number>(orbitQueryKeys.notifications.unreadCount),
      ).toBe(0);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orbitQueryKeys.notifications.all,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orbitQueryKeys.notifications.unreadCount,
    });
  });
});
