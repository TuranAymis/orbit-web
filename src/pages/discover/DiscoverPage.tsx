import { useState } from "react";
import { Compass, Flame, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { GroupGrid } from "@/features/groups/list-groups/ui/GroupGrid";
import { useGroups } from "@/features/groups/list-groups/model/useGroups";
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

export function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("groups");
  const { data, isLoading, isEmpty } = useGroups();

  return (
    <PageContainer
      title="Discover Communities"
      subtitle="Explore curated groups, trending topics, and fresh conversations across the Orbit network."
      actions={<Button>Explore feed</Button>}
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

        {activeTab === "groups" ? (
          <GroupGrid groups={data} isLoading={isLoading} isEmpty={isEmpty} />
        ) : (
          <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-14">
            <h3 className="text-lg font-semibold text-foreground">
              {activeTab === "events" ? "Events are coming next" : "Trending signals are warming up"}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This tab is reserved for the next Discover iteration. The shell and
              active state are ready, so we can add richer event and trend modules
              without reshaping the page structure later.
            </p>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
