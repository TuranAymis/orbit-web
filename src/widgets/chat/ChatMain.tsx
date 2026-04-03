import type { Channel, Message } from "@/entities/message/model/types";
import type { ChatConnectionStatus } from "@/features/chat/transport/chatTransport";
import { ChatHeader } from "@/widgets/chat/ChatHeader";
import { MessageInput } from "@/widgets/chat/MessageInput";
import { MessageList } from "@/widgets/chat/MessageList";

interface ChatMainProps {
  activeChannel?: Channel;
  messages: Message[];
  connectionStatus: ChatConnectionStatus;
  draft: string;
  setDraft: (value: string) => void;
  sendMessage: () => void;
}

export function ChatMain({
  activeChannel,
  messages,
  connectionStatus,
  draft,
  setDraft,
  sendMessage,
}: ChatMainProps) {
  return (
    <section className="flex min-h-[680px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-black/25">
      <ChatHeader activeChannel={activeChannel} connectionStatus={connectionStatus} />
      <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
        <MessageList
          messages={messages}
          channelName={activeChannel?.name ?? "this channel"}
        />
      </div>
      <MessageInput
        activeChannel={activeChannel}
        draft={draft}
        setDraft={setDraft}
        sendMessage={sendMessage}
      />
    </section>
  );
}
