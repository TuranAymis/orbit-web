import type { Channel } from "@/entities/message/model/types";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (channelId: string) => void;
}

export function ChatSidebar({
  channels,
  activeChannelId,
  setActiveChannelId,
}: ChatSidebarProps) {
  const groupedChannels = {
    channel: channels.filter((channel) => channel.kind === "channel"),
    dm: channels.filter((channel) => channel.kind === "dm"),
  };

  return (
    <aside className="rounded-[28px] border border-white/10 bg-black/20 p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Channels
          </h2>
          <div className="mt-3 space-y-2">
            {groupedChannels.channel.map((channel) => (
              <button
                key={channel.id}
                type="button"
                aria-label={channel.name.replace(/-/g, " ")}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
                  activeChannelId === channel.id
                    ? "border-primary/30 bg-primary/12 text-foreground"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground",
                )}
                onClick={() => setActiveChannelId(channel.id)}
              >
                <span className="truncate text-sm font-medium">#{channel.name}</span>
                {channel.unreadCount ? (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    {channel.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Direct Messages
          </h2>
          <div className="mt-3 space-y-2">
            {groupedChannels.dm.map((channel) => (
              <button
                key={channel.id}
                type="button"
                aria-label={channel.name.replace(/-/g, " ")}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition",
                  activeChannelId === channel.id
                    ? "border-primary/30 bg-primary/12 text-foreground"
                    : "border-transparent bg-transparent text-muted-foreground hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground",
                )}
                onClick={() => setActiveChannelId(channel.id)}
              >
                <span className="truncate text-sm font-medium">{channel.name}</span>
                {channel.unreadCount ? (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                    {channel.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
