import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupAboutPanelProps {
  group: GroupDetail;
}

export function GroupAboutPanel({ group }: GroupAboutPanelProps) {
  const summary = [
    { label: "Category", value: group.category || "Community" },
    { label: "Location", value: group.location || "Global" },
    { label: "Founder", value: group.founder || "Orbit Team" },
    { label: "Members", value: group.memberCount.toLocaleString("en-US") },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">About this group</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {group.description || "This community has not added a detailed description yet."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Community summary
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {group.name} is an Orbit hub for members who want a focused place to share
              progress, join events, and build momentum together.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-white/[0.03]">
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Weekly posts
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {group.stats.weeklyPosts.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Active members
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {group.stats.activeMembers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Upcoming events
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {group.stats.upcomingEvents.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

