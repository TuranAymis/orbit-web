import { BellRing } from "lucide-react";
import type { Notification } from "@/entities/notification/model/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

function formatRelativeTimestamp(createdAt: string) {
  const date = new Date(createdAt);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition",
        notification.isRead
          ? "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
          : "border-primary/20 bg-primary/[0.08] hover:bg-primary/[0.12]",
      )}
      onClick={() => onClick(notification)}
    >
      {notification.actor ? (
        <Avatar className="h-10 w-10">
          <AvatarFallback>{notification.actor.avatarFallback}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <BellRing className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          {!notification.isRead ? (
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {formatRelativeTimestamp(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
