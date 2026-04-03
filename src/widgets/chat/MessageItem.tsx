import type { Message } from "@/entities/message/model/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: Message;
}

function formatTime(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(createdAt));
}

function getStatusLabel(message: Message) {
  if (message.status === "sending") {
    return "Sending...";
  }

  if (message.status === "failed") {
    return message.canRetry ? "Failed to send. Retry soon." : "Failed to send.";
  }

  return "Sent";
}

export function MessageItem({ message }: MessageItemProps) {
  if (message.type === "system") {
    return (
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.08] px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{message.content}</span>
      </div>
    );
  }

  return (
    <article className="flex gap-3 rounded-2xl px-1 py-2">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{message.avatarFallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{message.username}</span>
          <time
            dateTime={message.createdAt}
            className="text-xs uppercase tracking-[0.24em] text-muted-foreground"
          >
            {formatTime(message.createdAt)}
          </time>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.24em]",
              message.status === "failed"
                ? "text-rose-300"
                : message.status === "sending"
                  ? "text-amber-300"
                  : "text-muted-foreground/70",
            )}
          >
            {getStatusLabel(message)}
          </span>
        </div>
        <p className={cn("mt-1 text-sm leading-6 text-foreground/90")}>{message.content}</p>
      </div>
    </article>
  );
}
