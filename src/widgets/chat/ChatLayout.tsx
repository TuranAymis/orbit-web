import type { Channel, Member, Message } from "@/entities/message/model/types";
import { ChatMain } from "@/widgets/chat/ChatMain";
import { ChatSidebar } from "@/widgets/chat/ChatSidebar";
import { MemberList } from "@/widgets/chat/MemberList";

interface ChatLayoutProps {
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (channelId: string) => void;
  activeChannel?: Channel;
  messages: Message[];
  members: Member[];
  draft: string;
  setDraft: (value: string) => void;
  sendMessage: () => void;
}

export function ChatLayout({
  channels,
  activeChannelId,
  setActiveChannelId,
  activeChannel,
  messages,
  members,
  draft,
  setDraft,
  sendMessage,
}: ChatLayoutProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
      <ChatSidebar
        channels={channels}
        activeChannelId={activeChannelId}
        setActiveChannelId={setActiveChannelId}
      />
      <ChatMain
        activeChannel={activeChannel}
        messages={messages}
        draft={draft}
        setDraft={setDraft}
        sendMessage={sendMessage}
      />
      <aside className="space-y-5 rounded-[28px] border border-white/10 bg-black/20 p-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
            Space context
          </p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">Workspace context</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep coordination lightweight here, then layer real-time transport on top
            once the backend socket contract is ready.
          </p>
        </div>
        <MemberList members={members} />
      </aside>
    </div>
  );
}
