import { useEffect, useMemo, useRef } from "react";
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
  const previousMessageCountRef = useRef(0);

  const dedupedMessages = useMemo(() => {
    const seenKeys = new Set<string>();

    return messages.filter((message) => {
      const key = message.serverMessageId ?? message.clientMessageId ?? message.id;

      if (seenKeys.has(key)) {
        return false;
      }

      seenKeys.add(key);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    const container = scrollRef.current;
    const nextMessageCount = dedupedMessages.length;
    const lastMessage = dedupedMessages[dedupedMessages.length - 1];
    const addedNewMessage = nextMessageCount > previousMessageCountRef.current;

    previousMessageCountRef.current = nextMessageCount;

    if (!container || !addedNewMessage || typeof endRef.current?.scrollIntoView !== "function") {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 120;
    const shouldFollowConversation = isNearBottom || lastMessage?.status === "sending";

    if (shouldFollowConversation) {
      endRef.current.scrollIntoView({ block: "end" });
    }
  }, [dedupedMessages]);

  if (dedupedMessages.length === 0) {
    return <ChatEmptyState channelName={channelName} />;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
      <div className="space-y-2">
        {dedupedMessages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
