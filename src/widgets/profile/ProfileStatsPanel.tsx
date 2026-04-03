import type { UserProfile } from "@/entities/user/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface ProfileStatsPanelProps {
  profile: UserProfile;
}

export function ProfileStatsPanel({ profile }: ProfileStatsPanelProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Stats at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Groups</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.stats.groupsJoined}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Events</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.stats.eventsAttended}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Messages</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {profile.stats.messagesSent}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
