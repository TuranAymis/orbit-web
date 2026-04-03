import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupStatsCardProps {
  group: GroupDetail;
}

export function GroupStatsCard({ group }: GroupStatsCardProps) {
  const stats = [
    { label: "Weekly posts", value: group.stats.weeklyPosts },
    { label: "Active members", value: group.stats.activeMembers },
    { label: "Upcoming events", value: group.stats.upcomingEvents },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {item.value.toLocaleString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
