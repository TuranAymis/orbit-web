import type { Membership } from "@/entities/membership/model/types";
import { PlanCard } from "@/entities/membership/ui/PlanCard";

interface PlanComparisonProps {
  membership: Membership;
  onUpgrade: () => void;
  isUpgrading?: boolean;
}

const freeBenefits = [
  "Join public communities",
  "Attend open community events",
  "Basic chat and notifications",
];

const premiumBenefits = [
  "Access private groups and premium event drops",
  "Advanced chat workflows and priority support",
  "Expanded activity limits and richer community tools",
];

export function PlanComparison({
  membership,
  onUpgrade,
  isUpgrading = false,
}: PlanComparisonProps) {
  const isFreePlanCurrent = membership.tier === "free";
  const isPremiumPlanCurrent = membership.tier === "premium";

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <PlanCard
        title="Orbit Free"
        tier="free"
        description="A strong starting plan for exploring public communities and events."
        benefits={freeBenefits}
        isCurrent={isFreePlanCurrent}
        ctaLabel={isPremiumPlanCurrent ? "Free plan" : "Current plan"}
        ctaVariant="outline"
        ctaDisabled={isPremiumPlanCurrent}
      />
      <PlanCard
        title="Orbit Premium"
        tier="premium"
        description="Unlock premium-only spaces, richer chat access, and faster support."
        benefits={premiumBenefits}
        isCurrent={isPremiumPlanCurrent}
        isHighlighted
        ctaLabel={isUpgrading ? "Upgrading..." : "Upgrade to premium"}
        onCtaClick={onUpgrade}
        ctaDisabled={isUpgrading}
      />
    </div>
  );
}
