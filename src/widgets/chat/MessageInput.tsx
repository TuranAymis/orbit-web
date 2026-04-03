import { Paperclip, PlusCircle, SendHorizonal } from "lucide-react";
import type { Channel } from "@/entities/message/model/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface MessageInputProps {
  draft: string;
  setDraft: (value: string) => void;
  sendMessage: () => void;
  activeChannel?: Channel;
}

export function MessageInput({
  draft,
  setDraft,
  sendMessage,
  activeChannel,
}: MessageInputProps) {
  const placeholderName = activeChannel?.kind === "channel"
    ? `#${activeChannel.name}`
    : activeChannel?.name ?? "conversation";

  return (
    <div className="sticky bottom-0 border-t border-white/10 bg-[linear-gradient(180deg,rgba(10,12,24,0.15),rgba(10,12,24,0.92)_22%,rgba(10,12,24,0.98))] px-5 pb-5 pt-4 backdrop-blur">
      <form
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <Button variant="ghost" size="icon" aria-label="Add attachment">
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Attach file">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`Message ${placeholderName}`}
          className="border-transparent bg-transparent px-1 focus-visible:border-transparent focus-visible:ring-0"
        />
        <Button
          type="submit"
          aria-label="Send message"
          disabled={draft.trim().length === 0}
        >
          <SendHorizonal className="h-4 w-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
