import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  author: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

export function ChatMessageBubble({
  author,
  content,
  timestamp,
  isOwn = false,
}: ChatMessageBubbleProps) {
  return (
    <div className={cn("flex gap-4", isOwn && "justify-end")}>
      {!isOwn ? (
        <Avatar className="h-10 w-10 rounded-2xl">
          <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : null}
      <div className={cn("max-w-[72%] space-y-2", isOwn && "items-end")}>
        <div
          className={cn(
            "rounded-[24px] border px-5 py-4 text-lg leading-8",
            isOwn
              ? "border-primary/30 bg-primary/12 text-primary"
              : "border-white/8 bg-white/[0.05] text-foreground",
          )}
        >
          {content}
        </div>
        <p className={cn("text-xs text-muted-foreground", isOwn && "text-right")}>{timestamp}</p>
      </div>
      {isOwn ? (
        <Avatar className="h-10 w-10 rounded-2xl">
          <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  );
}
