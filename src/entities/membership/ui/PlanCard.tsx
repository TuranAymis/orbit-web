import type { ReactNode } from "react";
import type { MembershipTier } from "@/entities/membership/model/types";
import { MembershipBadge } from "@/entities/membership/ui/MembershipBadge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  title: string;
  tier: MembershipTier;
  description: string;
  benefits: string[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  isCurrent?: boolean;
  isHighlighted?: boolean;
  footer?: ReactNode;
}

export function PlanCard({
  title,
  tier,
  description,
  benefits,
  ctaLabel,
  onCtaClick,
  isCurrent = false,
  isHighlighted = false,
  footer,
}: PlanCardProps) {
  return (
    <Card
      className={cn(
        "border-white/10 bg-white/[0.03]",
        isHighlighted && "border-primary/30 bg-primary/[0.06]",
      )}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <MembershipBadge tier={tier} />
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground">
          {benefits.map((benefit) => (
            <li key={benefit} className="rounded-xl border border-white/8 bg-black/20 px-3 py-2">
              {benefit}
            </li>
          ))}
        </ul>

        {ctaLabel ? (
          <Button
            className="w-full justify-center"
            variant={isCurrent ? "secondary" : "default"}
            onClick={onCtaClick}
            disabled={isCurrent}
          >
            {isCurrent ? "Current plan" : ctaLabel}
          </Button>
        ) : null}

        {footer}
      </CardContent>
    </Card>
  );
}
