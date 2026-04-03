import type { UserProfile } from "@/entities/user/model/types";
import { Card, CardContent } from "@/shared/ui/card";
import { Link } from "react-router-dom";

interface ProfileStatsPanelProps {
  profile: UserProfile;
}

export function ProfileStatsPanel({ profile }: ProfileStatsPanelProps) {
  const isZeroState =
    profile.stats.groupsJoined === 0 &&
    profile.stats.eventsAttended === 0 &&
    profile.stats.messagesSent === 0;

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
        {isZeroState ? (
          <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.05] px-4 py-4">
            <p className="text-sm font-medium text-foreground">Your Orbit profile is ready to grow</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Join your first group, attend an event, or start a conversation to bring this space to life.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/discover"
                className="inline-flex h-9 items-center justify-center rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
              >
                Join your first group
              </Link>
              <Link
                to="/chat"
                className="inline-flex h-9 items-center justify-center rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
              >
                Start a conversation
              </Link>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
