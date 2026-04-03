import { Hash, MessageSquareMore } from "lucide-react";
import type { Channel } from "@/entities/message/model/types";
import type { ChatConnectionStatus } from "@/features/chat/transport/chatTransport";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  activeChannel?: Channel;
  connectionStatus: ChatConnectionStatus;
}

const connectionLabelMap: Record<ChatConnectionStatus, string> = {
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting",
};

export function ChatHeader({ activeChannel, connectionStatus }: ChatHeaderProps) {
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
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground md:inline-flex">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            connectionStatus === "connected"
              ? "bg-emerald-400"
              : connectionStatus === "reconnecting"
                ? "bg-amber-400"
                : connectionStatus === "connecting"
                  ? "bg-sky-400"
                  : "bg-slate-500",
          )}
        />
        {connectionLabelMap[connectionStatus]}
      </div>
    </div>
  );
}
