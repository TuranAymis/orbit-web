import { useMemo, useState } from "react";
import { Compass, Flame, RefreshCcw, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { GroupGrid } from "@/features/groups/list-groups/ui/GroupGrid";
import { EventGrid } from "@/widgets/event-list/EventGrid";
import {
  useDiscoverFeed,
  type DiscoverTrendItem,
} from "@/features/discover/get-discover-feed/model/useDiscoverFeed";
import { cn } from "@/lib/utils";

type DiscoverTab = "groups" | "events" | "trending";

const discoverTabs: Array<{
  id: DiscoverTab;
  label: string;
  icon: typeof Compass;
}> = [
  { id: "groups", label: "Groups", icon: Compass },
  { id: "events", label: "Events", icon: Sparkles },
  { id: "trending", label: "Trending", icon: Flame },
];

function DiscoverLoadingState() {
  return (
    <div
      data-testid="discover-loading"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <div className="aspect-[16/10] animate-pulse bg-white/10" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscoverErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="rounded-3xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-foreground">
        We couldn&apos;t load Discover right now
      </h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Orbit ran into a temporary feed issue while loading communities and live events.
        Try again to refresh the aggregated discover feed.
      </p>
      <Button className="mt-6" variant="outline" onClick={onRetry}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </section>
  );
}

function DiscoverEmptyState({
  activeTab,
  onRefresh,
  onBrowseEvents,
}: {
  activeTab: DiscoverTab;
  onRefresh: () => void;
  onBrowseEvents: () => void;
}) {
  const copy =
    activeTab === "groups"
      ? {
          title: "No groups are ready yet",
          description:
            "We couldn't find any communities in the current feed yet. Refresh for a fresh sync or browse live events while the network catches up.",
        }
      : activeTab === "events"
        ? {
          title: "No events are available yet",
          description:
            "No live sessions are showing up right now. Refresh the feed or jump back to groups to find active communities first.",
          }
        : {
            title: "No trends are active yet",
            description:
              "Trending signals will appear here once communities and events begin picking up momentum in the feed.",
          };

  return (
    <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <h3 className="text-lg font-semibold text-foreground">{copy.title}</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {copy.description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh feed
        </Button>
        {activeTab !== "events" ? (
          <Button variant="secondary" onClick={onBrowseEvents}>
            Browse events
          </Button>
        ) : (
          <Link
            to="/groups"
            className="inline-flex h-10 items-center justify-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/15"
          >
            Explore groups
          </Link>
        )}
      </div>
    </section>
  );
}

function TrendingGrid({ items }: { items: DiscoverTrendItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.05]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            {item.kind ?? "trend"}
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {item.description}
          </p>
          <div className="mt-6 flex items-end justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {item.metricLabel}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item.metricValue}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground">
              Live
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("groups");
  const { groups, events, trending, isLoading, error, refetch } = useDiscoverFeed();

  const activeCount = useMemo(() => {
    if (activeTab === "groups") {
      return groups.length;
    }

    if (activeTab === "events") {
      return events.length;
    }

    return trending.length;
  }, [activeTab, events.length, groups.length, trending.length]);

  return (
    <PageContainer
      title="Discover Communities"
      subtitle="Explore curated groups, upcoming events, and live activity across the Orbit network."
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          Refresh feed
        </Button>
      }
    >
      <div className="space-y-6">
        <div
          role="tablist"
          aria-label="Discover sections"
          className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
        >
          {discoverTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(168,85,247,0.22)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Discover Feed
            </p>
            <p className="mt-1 text-sm text-foreground">
              {activeCount.toLocaleString()} item{activeCount === 1 ? "" : "s"} in this section
            </p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Backend-driven
          </span>
        </div>

        {isLoading ? (
          <DiscoverLoadingState />
        ) : error ? (
          <DiscoverErrorState onRetry={() => void refetch()} />
        ) : activeTab === "groups" ? (
          groups.length === 0 ? (
            <DiscoverEmptyState
              activeTab={activeTab}
              onRefresh={() => void refetch()}
              onBrowseEvents={() => setActiveTab("events")}
            />
          ) : (
            <GroupGrid groups={groups} />
          )
        ) : activeTab === "events" ? (
          events.length === 0 ? (
            <DiscoverEmptyState
              activeTab={activeTab}
              onRefresh={() => void refetch()}
              onBrowseEvents={() => setActiveTab("events")}
            />
          ) : (
            <EventGrid events={events} />
          )
        ) : trending.length === 0 ? (
          <DiscoverEmptyState
            activeTab={activeTab}
            onRefresh={() => void refetch()}
            onBrowseEvents={() => setActiveTab("events")}
          />
        ) : (
          <TrendingGrid items={trending} />
        )}
      </div>
    </PageContainer>
  );
}
