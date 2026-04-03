import { RefreshCw } from "lucide-react";
import { useNotifications } from "@/features/notifications/list-notifications/model/useNotifications";
import { useMarkNotificationRead } from "@/features/notifications/mark-notification-read/model/useMarkNotificationRead";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { NotificationEmptyState } from "@/widgets/notifications/NotificationEmptyState";
import { NotificationList } from "@/widgets/notifications/NotificationList";

export function NotificationPanel() {
  const { data, isLoading, error, isEmpty, refetch } = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  return (
    <Card className="w-[22rem] border-white/10 bg-[#09090f]/95 shadow-2xl shadow-black/40">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity across your groups, events, and chats.
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Refresh notifications" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[28rem] overflow-y-auto pr-1">
          {isLoading ? (
            <div data-testid="notifications-loading" className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-8 text-center">
              <h3 className="text-base font-semibold text-foreground">
                We couldn&apos;t load notifications
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Retry to request the latest activity feed from Orbit.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : null}

          {!isLoading && !error && isEmpty ? <NotificationEmptyState /> : null}

          {!isLoading && !error && !isEmpty ? (
            <NotificationList
              notifications={data}
              onNotificationClick={(notification) => {
                if (!notification.isRead) {
                  void markReadMutation.mutateAsync(notification.id);
                }
              }}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
