import { useLayoutEffect, useRef } from "react";
import { BellOff, BellRing, Search } from "lucide-react";
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
  const messageListRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const previousChannelIdRef = useRef<string | null>(null);
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
    isLoading,
    error,
    muteError,
    members,
    connectionStatus,
    sendMessage,
    draft,
    setDraft,
    typingLabel,
    toggleMuteChannel,
    isActiveChannelMuted,
    readStateLabel,
  } = useChat({
    preferredChannelId: searchParams.get("groupId"),
  });

  useLayoutEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    const channelChanged = previousChannelIdRef.current !== activeChannelId;
    if (channelChanged || isAtBottomRef.current) {
      list.scrollTop = list.scrollHeight;
      isAtBottomRef.current = true;
    }
    previousChannelIdRef.current = activeChannelId;
  }, [activeChannelId, messages]);

  const connectionTone =
    connectionStatus === "connected"
      ? "text-emerald-300"
      : connectionStatus === "reconnecting" || connectionStatus === "connecting"
        ? "text-amber-300"
        : "text-rose-300";

  return (
    <PageContainer
      title="Messages"
      className="flex h-full min-h-0 flex-col gap-4 space-y-0"
      contentClassName="min-h-0 flex-1"
      headerClassName="hidden lg:flex"
    >
      <h2 className="sr-only">Orbit Workspace Chat</h2>
      {isLoading && <p>Mesajlar yükleniyor…</p>}
      {error && <p role="alert">Mesajlar yüklenemedi.</p>}
      {muteError && <p role="alert">Mute setting could not be saved. Please try again.</p>}
      {connectionStatus === "reconnecting" && <p role="status">Sohbet yeniden bağlanıyor…</p>}
      <div className="grid h-full min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[24px] border border-white/8 bg-[#111117] lg:grid-cols-[220px_minmax(0,1fr)] lg:grid-rows-1 2xl:grid-cols-[220px_minmax(0,1fr)_240px]">
        <aside className="flex min-w-0 items-center gap-3 border-b border-white/8 bg-[#15151b] px-2 py-2 lg:block lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4">
          <h2 className="shrink-0 text-lg font-bold tracking-tight text-foreground lg:hidden">Messages</h2>
          <div className="min-w-0 flex-1 lg:space-y-5">
            <div className="hidden space-y-2 lg:block">
              <h3 className="sr-only">Channels</h3>
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                {connectionStatus}
              </p>
            </div>

            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-11" />
            </div>

            <div className="flex min-w-0 gap-2 overflow-x-auto lg:block lg:space-y-2 lg:overflow-visible">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  aria-label={channel.name.replace(/-/g, " ")}
                  className={cn(
                    "flex min-h-10 max-w-40 shrink-0 items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition lg:w-full lg:max-w-none lg:py-3",
                    channel.id === activeChannelId
                      ? "bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                      : "hover:bg-white/[0.03]",
                  )}
                  onClick={() => setActiveChannelId(channel.id)}
                >
                  <Avatar className="hidden h-11 w-11 shrink-0 rounded-[16px] lg:flex">
                    <AvatarFallback>{channel.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-sm font-semibold tracking-tight text-foreground lg:text-base">
                        {channel.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {channel.isMuted ? (
                          <BellOff className="h-4 w-4 text-muted-foreground/70" />
                        ) : null}
                        {channel.unreadCount ? (
                          <span
                            className={cn(
                              "inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
                              channel.unreadMentionCount
                                ? "bg-amber-300/18 text-amber-200 ring-1 ring-amber-300/30"
                                : channel.isMuted
                                  ? "bg-white/[0.05] text-muted-foreground"
                                  : "bg-primary/15 text-primary",
                            )}
                          >
                            {channel.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <p
                      className={cn(
                        "hidden truncate text-sm lg:block",
                        channel.unreadMentionCount
                          ? "text-amber-200"
                          : "text-muted-foreground",
                      )}
                    >
                      {channel.unreadMentionCount
                        ? "Mentioned you"
                        : channel.kind === "dm"
                          ? "Direct message"
                          : "The event starts at 8PM sharp."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex min-h-14 items-center justify-between gap-2 border-b border-white/8 px-3 py-2 lg:px-5 lg:py-4">
            <div className="flex min-w-0 items-center gap-2 lg:gap-4">
              <Avatar className="hidden h-12 w-12 shrink-0 rounded-[16px] sm:flex">
                <AvatarFallback>
                  {activeChannel?.name.slice(0, 2).toUpperCase() ?? "CH"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-tight text-foreground sm:text-xl lg:text-2xl">
                  {activeChannel?.name ?? "Conversation"}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
                  <p className={cn("text-xs uppercase tracking-wide", connectionTone)}>
                    Status: {connectionStatus}
                  </p>
                  <p className="hidden text-xs uppercase tracking-wide text-muted-foreground sm:block">
                    {readStateLabel}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={isActiveChannelMuted ? "Unmute conversation" : "Mute conversation"}
              onClick={() => activeChannelId && toggleMuteChannel(activeChannelId)}
            >
              {isActiveChannelMuted ? (
                <BellOff className="h-5 w-5 text-amber-200" />
              ) : (
                <BellRing className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div
            ref={messageListRef}
            onScroll={(event) => {
              const list = event.currentTarget;
              isAtBottomRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
            }}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6"
          >
            {typingLabel ? (
              <div className="flex justify-center">
                <Badge variant="muted">{typingLabel} is typing...</Badge>
              </div>
            ) : null}
            {activeChannel && <div className="flex justify-center">
              <Badge variant="muted">Today</Badge>
            </div>}
            {isLoading ? null : !activeChannel ? (
              <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-10 text-center">
                <p className="text-2xl font-bold tracking-tight text-foreground">No channels yet</p>
                <p className="mt-3 text-base text-muted-foreground">Join a group to start chatting.</p>
              </div>
            ) : messages.length === 0 ? (
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
                  isMention={message.isMention}
                />
              ))
            )}
          </div>

          <div className="border-t border-white/8 px-2 py-2 sm:px-4 lg:px-5 lg:py-4">
            <form
              className="flex min-w-0 items-center gap-2 rounded-[20px] border border-white/8 bg-white/[0.03] px-2 py-2 sm:px-4"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <Input
                disabled={!activeChannel}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${activeChannel?.kind === "channel" ? `#${activeChannel.name}` : activeChannel?.name ?? "conversation"}`}
                aria-label={`Message ${activeChannel?.kind === "channel" ? `#${activeChannel.name}` : activeChannel?.name ?? "conversation"}`}
                className="min-w-0 border-transparent bg-transparent px-1 focus-visible:border-transparent focus-visible:ring-0"
              />
              <Button type="submit" aria-label="Send message" disabled={!activeChannel || draft.trim().length === 0}>
                Send
              </Button>
            </form>
          </div>
        </section>

        <aside className="hidden overflow-y-auto border-l border-white/8 bg-[#14141a] 2xl:block">
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
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
