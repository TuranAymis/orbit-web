import { Lock } from "lucide-react";
import type { MembershipFeature } from "@/entities/membership/model/types";
import type { MembershipTier } from "@/entities/membership/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface FeatureGateNoticeProps {
  feature: MembershipFeature;
  requiredTier: MembershipTier;
  onUpgrade?: () => void;
}

export function FeatureGateNotice({
  feature,
  requiredTier,
  onUpgrade,
}: FeatureGateNoticeProps) {
  return (
    <Card className="border-primary/20 bg-primary/[0.06]">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Upgrade to unlock this feature</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {feature} is part of the {requiredTier} membership tier. Upgrade when
            you&apos;re ready for deeper access across Orbit.
          </p>
        </div>
        <Button onClick={onUpgrade}>Upgrade to premium</Button>
      </CardContent>
    </Card>
  );
}
