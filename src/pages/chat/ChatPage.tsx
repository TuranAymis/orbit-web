import { Phone, Video, MoreVertical, Plus, Smile, Mic, Search } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useChat } from "@/features/chat/model/useChat";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PageContainer } from "@/shared/ui/page-container";
import { ChatMessageBubble } from "@/widgets/orbit/ChatMessageBubble";
import { cn } from "@/lib/utils";

export function ChatPage() {
  const searchParams =
    typeof window === "undefined"
      ? new URLSearchParams()
      : new URLSearchParams(window.location.search);
  const { user } = useAuth();
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
      title="Messages"
      subtitle="Three-column Orbit chat layout driven by the existing conversation and send-message logic."
    >
      <h2 className="sr-only">Orbit Workspace Chat</h2>
      <div className="grid min-h-[820px] gap-0 overflow-hidden rounded-[30px] border border-white/8 bg-[#111117] xl:grid-cols-[380px_minmax(0,1fr)_280px]">
        <aside className="border-r border-white/8 bg-[#15151b] p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight text-foreground">Messages</h2>
              <h3 className="sr-only">Channels</h3>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                {connectionStatus}
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-11" />
            </div>

            <div className="space-y-3">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  aria-label={channel.name.replace(/-/g, " ")}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-[24px] border border-transparent px-3 py-4 text-left transition",
                    channel.id === activeChannelId
                      ? "bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/[0.03]",
                  )}
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  <Avatar className="h-14 w-14 rounded-[20px]">
                    <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-2xl font-semibold tracking-tight text-foreground">
                        {channel.name}
                      </p>
                      <p className="text-sm text-primary">{channel.unreadCount ? `${channel.unreadCount}m` : ""}</p>
                    </div>
                    <p className="truncate text-base text-muted-foreground">
                      {channel.kind === "dm"
                        ? "Direct message"
                        : "The event starts at 8PM sharp."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 rounded-[20px]">
                <AvatarFallback>
                  {activeChannel?.name.slice(0, 2).toUpperCase() ?? "CH"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-4xl font-bold tracking-tight text-foreground">
                  {activeChannel?.name ?? "Conversation"}
                </p>
                <p className="text-sm uppercase tracking-[0.2em] text-primary">
                  Status: {connectionStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Call">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Video">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="More">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            <div className="flex justify-center">
              <Badge variant="muted">Today</Badge>
            </div>
            {messages.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-10 text-center">
                <p className="text-2xl font-bold tracking-tight text-foreground">No messages yet</p>
                <p className="mt-3 text-base text-muted-foreground">
                  Start the conversation in {(activeChannel?.name ?? "this channel").replace(/-/g, " ")}.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  author={message.username}
                  content={message.content}
                  timestamp={new Date(message.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  isOwn={message.username === user?.name}
                />
              ))
            )}
          </div>

          <div className="border-t border-white/8 px-6 py-5">
            <form
              className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <Button variant="ghost" size="icon" aria-label="Add">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Emoji">
                <Smile className="h-5 w-5" />
              </Button>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${activeChannel?.kind === "channel" ? `#${activeChannel.name}` : activeChannel?.name ?? "conversation"}`}
                aria-label={`Message ${activeChannel?.kind === "channel" ? `#${activeChannel.name}` : activeChannel?.name ?? "conversation"}`}
                className="border-transparent bg-transparent px-1 focus-visible:border-transparent focus-visible:ring-0"
              />
              <Button variant="ghost" size="icon" aria-label="Voice">
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" aria-label="Send message" disabled={draft.trim().length === 0}>
                Send
              </Button>
            </form>
          </div>
        </section>

        <aside className="border-l border-white/8 bg-[#14141a]">
          <div className="space-y-6 p-6">
            <div className="space-y-5">
              <Avatar className="h-36 w-36 rounded-[30px]">
                <AvatarFallback className="text-3xl">
                  {activeChannel?.name.slice(0, 2).toUpperCase() ?? "CH"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-4xl font-bold tracking-tight text-foreground">
                  {activeChannel?.name ?? "Workspace"}
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Lead Architect
                </p>
              </div>
            </div>

            <h3 className="sr-only">Members</h3>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-white/8 bg-white/[0.03]">
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Posts</p>
                  <p className="text-4xl font-bold tracking-tight text-foreground">1.2k</p>
                </CardContent>
              </Card>
              <Card className="border-white/8 bg-white/[0.03]">
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Groups</p>
                  <p className="text-4xl font-bold tracking-tight text-foreground">{members.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Shared Media</p>
              <p className="text-sm text-muted-foreground">Online now</p>
              <div className="grid grid-cols-2 gap-3">
                {members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className="flex h-24 items-end rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(182,100,255,0.12),rgba(255,255,255,0.03))] p-3"
                  >
                    <span className="text-sm font-semibold text-foreground">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Block Contact</p>
              <Button variant="outline" className="w-full justify-center">
                Manage Safety
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
