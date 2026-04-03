import type { Membership } from "@/entities/membership/model/types";
import { MembershipBadge } from "@/entities/membership/ui/MembershipBadge";
import { Card, CardContent } from "@/shared/ui/card";

interface MembershipOverviewProps {
  membership: Membership;
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MembershipOverview({ membership }: MembershipOverviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Current plan
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {membership.tier === "premium" ? "Premium Orbit" : "Orbit Free"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Status: {membership.status.replace("_", " ")}
            </p>
          </div>
          <MembershipBadge tier={membership.tier} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Started</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {formatDateLabel(membership.startedAt)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Renews</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {formatDateLabel(membership.renewsAt)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Group joins
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {membership.limits.groupJoinsPerMonth === null
                ? "Unlimited"
                : `${membership.limits.groupJoinsPerMonth} / month`}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Support</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {membership.tier === "premium" ? "Priority access" : "Standard queue"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
