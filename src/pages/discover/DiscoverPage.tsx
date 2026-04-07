import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, MessageSquareText, RefreshCcw } from "lucide-react";
import { useDiscoverFeed } from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import {
  getDiscoverSection,
  type DiscoverPageSection,
} from "@/features/discover/get-discover-feed/model/discoverPageData";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { Tabs } from "@/shared/ui/tabs";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { FeedCard } from "@/widgets/orbit/FeedCard";
import { DiscoverGroupsSection } from "@/widgets/discover/DiscoverGroupsSection";
import { DiscoverEventsSection } from "@/widgets/discover/DiscoverEventsSection";
import { DiscoverSectionSkeleton } from "@/widgets/discover/DiscoverSectionSkeleton";

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
  const { data, feed, error, refetch } = useDiscoverFeed();
  const joinGroupMutation = useJoinGroup();
  const { message, clearMessage } = useMutationFeedback(joinGroupMutation.error);
  const groupsSection = getDiscoverSection(data.sections, "groups");
  const eventsSection = getDiscoverSection(data.sections, "events");

  const featuredGroup = groupsSection?.items[0];
  const highlightedEvent = eventsSection?.items[0];
  const heroTitle = "Local Reality";
  const heroDescription =
    featuredGroup?.description ??
    "Join the underground Orbit network of synthetic creators and shape what comes next.";

  const visibleSections = useMemo<DiscoverPageSection[]>(() => {
    const sections = data.sections.map((section) => {
      if (activeTab === "trending") {
        if (section.type === "groups") {
          return {
            ...section,
            title: "Trending Groups",
            items: [...section.items].sort((left, right) => right.memberCount - left.memberCount),
          };
        }

        return {
          ...section,
          title: "Trending Events",
          items: [...section.items].sort((left, right) => right.attendeeCount - left.attendeeCount),
        };
      }

      if (activeTab === "latest" && section.type === "events") {
        return {
          ...section,
          title: "Latest Events",
          items: [...section.items].sort(
            (left, right) =>
              new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime(),
          ),
        };
      }

      return section;
    });

    if (activeTab === "latest") {
      return sections.filter((section) => section.type === "events");
    }

    return sections;
  }, [activeTab, data.sections]);

  const feedItems = useMemo<DiscoverFeedCardItem[]>(() => {
    const currentEvents = getDiscoverSection(visibleSections, "events")?.items ?? [];
    const currentGroups = getDiscoverSection(visibleSections, "groups")?.items ?? [];

    if (activeTab === "latest") {
      return currentEvents.slice(0, 3).map((event) => ({
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

    if (activeTab === "trending") {
      return [
        ...currentGroups.slice(0, 2).map((group) => ({
          id: `trend_group_${group.id}`,
          author: "GROUP",
          meta: `${group.memberCount.toLocaleString()} members`,
          title: `${group.name} is trending`,
          description: group.description,
          imageUrl: group.imageUrl,
          tag: "Trending",
        })),
        ...currentEvents.slice(0, 2).map((event) => ({
          id: `trend_event_${event.id}`,
          author: "EVENT",
          meta: `${event.attendeeCount.toLocaleString()} attendees`,
          title: `${event.title} is gaining momentum`,
          description: event.description,
          imageUrl: event.coverImageUrl,
          tag: "Trending",
        })),
      ];
    }

    return currentGroups.slice(0, 3).map((group) => ({
      id: group.id,
      author: "Vector Void",
      meta: `${group.memberCount.toLocaleString()} members`,
      title: "The architecture of synthetic dreams",
      description: group.description,
      imageUrl: group.imageUrl,
      tag: group.isJoined ? "Joined" : "For You",
    }));
  }, [activeTab, visibleSections]);

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

          {error ? (
            <ErrorState
              title="We couldn't load Discover right now"
              description="Try again to refresh the discover feed."
              onAction={() => void refetch()}
            />
          ) : !data.isLoading && !data.hasAnyContent && !data.hasAnyError ? (
            <EmptyState
              title="Discover is quiet right now"
              description="Refresh for a fresh sync or browse live events while the network catches up."
            />
          ) : (
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

              {data.isLoading ? (
                <div data-testid="discover-loading" className="space-y-6">
                  <DiscoverSectionSkeleton />
                  <DiscoverSectionSkeleton />
                </div>
              ) : (
                visibleSections.map((section) =>
                  section.type === "groups" ? (
                    <DiscoverGroupsSection
                      key={section.type}
                      title={section.title}
                      description={section.description}
                      groups={section.items.slice(0, 2)}
                      error={section.error}
                      isJoiningGroupId={joinGroupMutation.pendingGroupId}
                      onJoinGroup={(groupId) => void joinGroupMutation.joinById(groupId)}
                      onRetry={() => void refetch()}
                    />
                  ) : (
                    <DiscoverEventsSection
                      key={section.type}
                      title={section.title}
                      description={section.description}
                      events={section.items.slice(0, 2)}
                      error={section.error}
                      onRetry={() => void refetch()}
                    />
                  ),
                )
              )}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {activeTab !== "latest" ? (
            <Card className="border-white/8 bg-[#14141a]">
              <CardContent className="space-y-4 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Upcoming rituals
                </p>
                {feed.events.slice(0, 2).map((event) => (
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
