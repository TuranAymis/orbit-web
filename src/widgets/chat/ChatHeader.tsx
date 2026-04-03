import { Hash, MessageSquareMore } from "lucide-react";
import type { Channel } from "@/entities/message/model/types";

interface ChatHeaderProps {
  activeChannel?: Channel;
}

export function ChatHeader({ activeChannel }: ChatHeaderProps) {
  if (!activeChannel) {
    return null;
  }

  const isChannel = activeChannel.kind === "channel";
  const Icon = isChannel ? Hash : MessageSquareMore;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground">
            {isChannel ? `#${activeChannel.name}` : activeChannel.name}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {isChannel
              ? "Team-wide conversation with shareable context."
              : "Private direct thread for quick coordination."}
          </p>
        </div>
      </div>
      <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground md:block">
        Orbit chat
      </div>
    </div>
  );
}
