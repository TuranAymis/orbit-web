import { MessageSquareText } from "lucide-react";
import { useChat } from "@/features/chat/model/useChat";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { ChatLayout } from "@/widgets/chat/ChatLayout";

export function ChatPage() {
  const searchParams =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);
  const {
    channels,
    activeChannelId,
    setActiveChannelId,
    activeChannel,
    messages,
    members,
    connectionStatus,
    sendMessage,
    draft,
    setDraft,
  } = useChat({
    preferredChannelId: searchParams.get("groupId"),
  });

  return (
    <PageContainer
      title="Orbit Workspace Chat"
      subtitle="A local-first messaging architecture for channels, direct messages, and member presence before real-time transport lands."
      actions={
        <Button variant="outline">
          <MessageSquareText className="h-4 w-4" />
          New thread
        </Button>
      }
    >
      <ChatLayout
        channels={channels}
        activeChannelId={activeChannelId}
        setActiveChannelId={setActiveChannelId}
        activeChannel={activeChannel}
        messages={messages}
        members={members}
        connectionStatus={connectionStatus}
        draft={draft}
        setDraft={setDraft}
        sendMessage={sendMessage}
      />
    </PageContainer>
  );
}
