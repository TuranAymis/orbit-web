import { useEffect, useRef } from "react";
import type { Message } from "@/entities/message/model/types";
import { ChatEmptyState } from "@/widgets/chat/ChatEmptyState";
import { MessageItem } from "@/widgets/chat/MessageItem";

interface MessageListProps {
  messages: Message[];
  channelName?: string;
}

export function MessageList({ messages, channelName = "this channel" }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return <ChatEmptyState channelName={channelName} />;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
      <div className="space-y-2">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
