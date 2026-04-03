import type { MembershipTier } from "@/entities/membership/model/types";
import { cn } from "@/lib/utils";

interface MembershipBadgeProps {
  tier: MembershipTier;
}

export function MembershipBadge({ tier }: MembershipBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em]",
        tier === "premium"
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-white/10 bg-white/[0.04] text-muted-foreground",
      )}
    >
      {tier}
    </span>
  );
}
