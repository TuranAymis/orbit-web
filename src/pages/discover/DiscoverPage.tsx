import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, MessageSquareText, RefreshCcw } from "lucide-react";
import { useDiscoverFeed } from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { AsyncState } from "@/shared/ui/AsyncState";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { Tabs } from "@/shared/ui/tabs";
import { LoadingState } from "@/shared/ui/LoadingState";
import { GroupCard } from "@/entities/group/ui/GroupCard";
import { FeedCard } from "@/widgets/orbit/FeedCard";
import { EventCard } from "@/entities/event/ui/EventCard";

type DiscoverTab = "for-you" | "trending" | "latest";
interface DiscoverFeedCardItem {
  id: string;
  author: string;
  meta: string;
  title: string;
  description: string;
  tag: string;
  imageUrl?: string;
}

export function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("for-you");
  const {
    groups,
    events,
    trending,
    isLoading,
    error,
    groupsError,
    eventsError,
    refetch,
  } = useDiscoverFeed();
  const joinGroupMutation = useJoinGroup();
  const { message, clearMessage } = useMutationFeedback(joinGroupMutation.error);

  const featuredGroup = groups[0];
  const highlightedEvent = events[0];
  const heroTitle = "Local Reality";
  const heroDescription =
    featuredGroup?.description ??
    "Join the underground Orbit network of synthetic creators and shape what comes next.";

  const feedItems = useMemo<DiscoverFeedCardItem[]>(() => {
    if (activeTab === "trending") {
      return trending.slice(0, 4).map((item) => ({
        id: item.id,
        author: item.kind?.toUpperCase() ?? "TREND",
        meta: item.metricLabel,
        title: item.title,
        description: item.description,
        tag: item.metricValue,
      }));
    }

    if (activeTab === "latest") {
      return events.slice(0, 3).map((event) => ({
        id: event.id,
        author: event.category,
        meta: new Date(event.startsAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        title: "Live from the workshop feed",
        description: event.description,
        imageUrl: event.coverImageUrl,
        tag: event.isJoined ? "Attending" : "Open",
      }));
    }

    return groups.slice(0, 3).map((group) => ({
      id: group.id,
      author: "Vector Void",
      meta: `${group.memberCount.toLocaleString()} members`,
      title: "The architecture of synthetic dreams",
      description: group.description,
      imageUrl: group.imageUrl,
      tag: group.isJoined ? "Joined" : "For You",
    }));
  }, [activeTab, events, groups, trending]);

  return (
    <PageContainer
      title="Discover"
      subtitle="Explore the Orbit main feed, trending communities, and live event signals."
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          <RefreshCcw className="h-4 w-4" />
          Refresh feed
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <h2 className="sr-only">Discover Communities</h2>
          {message ? (
            <div className="rounded-[22px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>{message}</span>
                <Button size="sm" variant="ghost" onClick={clearMessage}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : null}

          <Card className="overflow-hidden border-white/8 bg-[#14141a]">
            <div className="relative min-h-[270px]">
              {featuredGroup ? (
                <img
                  src={featuredGroup.imageUrl}
                  alt={featuredGroup.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,12,0.92),rgba(8,8,12,0.48))]" />
              <div className="relative space-y-5 p-8 md:p-10">
                <Badge>Discover</Badge>
                <div className="max-w-2xl space-y-4">
                  <h2 className="text-5xl font-bold uppercase tracking-[-0.05em] text-foreground md:text-7xl">
                    {heroTitle}
                  </h2>
                  <p className="text-lg leading-8 text-muted-foreground">{heroDescription}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              items={[
                { value: "for-you", label: "For You" },
                { value: "trending", label: "Trending" },
                { value: "latest", label: "Latest", ariaLabel: "Events" },
              ]}
            />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button variant="ghost" size="icon" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="List view">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error || (activeTab === "latest" && eventsError) ? (
            <div className="rounded-[24px] border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                We couldn&apos;t load Discover right now
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Try again to refresh the aggregated discover feed.
              </p>
              <Button className="mt-5" variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : !isLoading && feedItems.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-12 text-center">
              <h3 className="text-xl font-semibold text-foreground">No groups are ready yet</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Refresh for a fresh sync or browse live events while the network catches up.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outline" onClick={() => void refetch()}>
                  Refresh feed
                </Button>
                <Button variant="secondary">Browse events</Button>
              </div>
            </div>
          ) : (
            <AsyncState
              isLoading={isLoading}
              error={null}
              isEmpty={false}
              onRetry={() => void refetch()}
              loadingFallback={<LoadingState data-testid="discover-loading" />}
            >
            <div className="space-y-6">
              {feedItems[0] ? (
                <FeedCard
                  author={feedItems[0].author}
                  meta={feedItems[0].meta}
                  title={feedItems[0].title}
                  description={feedItems[0].description}
                  imageUrl={feedItems[0].imageUrl}
                  tag={feedItems[0].tag}
                />
              ) : null}

              <div className="grid gap-5 lg:grid-cols-2">
                {groups.slice(0, 2).map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isJoining={joinGroupMutation.pendingGroupId === group.id}
                    onJoinGroup={(groupId) => void joinGroupMutation.joinById(groupId)}
                  />
                ))}
              </div>

              {activeTab === "latest" ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {events.slice(0, 2).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : null}
            </div>
            </AsyncState>
          )}
        </div>

        <aside className="space-y-6">
          {activeTab !== "latest" ? (
            <Card className="border-white/8 bg-[#14141a]">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Upcoming rituals
                </p>
                {events.slice(0, 2).map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-center gap-4 rounded-[22px] border border-white/8 bg-black/40 p-4 transition hover:border-primary/20"
                  >
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[18px] bg-black text-center">
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(event.startsAt).toLocaleString("en-US", { month: "short" })}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {new Date(event.startsAt).toLocaleString("en-US", { day: "2-digit" })}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{event.location}</p>
                      <p className="truncate text-sm uppercase tracking-[0.16em] text-muted-foreground">
                        {event.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-white/8 bg-[#14141a]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Live comms
                </p>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-3">
                <div className="rounded-[20px] bg-white/[0.05] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Xenon_7
                  </p>
                  <p className="mt-2 text-base leading-7 text-foreground">
                    Anyone seen the new neural presets?
                  </p>
                </div>
                <div className="rounded-[20px] border border-primary/20 bg-primary/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    You
                  </p>
                  <p className="mt-2 text-base leading-7 text-foreground">
                    Checking them out now. The contrast is insane.
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="w-full justify-between">
                Join the void...
                <MessageSquareText className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(182,100,255,0.08),rgba(255,255,255,0.02))]">
            <CardContent className="space-y-4 p-6">
              <Badge>Orbit Pro</Badge>
              <p className="text-lg leading-8 text-muted-foreground">
                Unlock unrestricted access to premium group spaces, high-signal chat,
                and members-only events.
              </p>
              <Link to="/membership">
                <Button className="w-full justify-center uppercase tracking-[0.18em]">
                  Go Premium
                </Button>
              </Link>
            </CardContent>
          </Card>

          {highlightedEvent && activeTab !== "latest" ? (
            <Card className="border-white/8 bg-[#14141a]">
              <CardContent className="space-y-3 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Currently highlighted
                </p>
                <p className="text-2xl font-bold tracking-tight text-foreground">Signal highlight</p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {highlightedEvent.description}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </PageContainer>
  );
}
