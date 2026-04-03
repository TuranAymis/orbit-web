import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getRequiredTier, hasMembershipAccess } from "@/entities/membership/access";
import type { Membership, MembershipFeature } from "@/entities/membership/model/types";
import { FeatureGateNotice } from "@/entities/membership/ui/FeatureGateNotice";

interface FeatureGateProps {
  feature: MembershipFeature;
  membership: Membership | null | undefined;
  children: ReactNode;
}

export function FeatureGate({
  feature,
  membership,
  children,
}: FeatureGateProps) {
  const navigate = useNavigate();

  if (hasMembershipAccess(membership, feature)) {
    return <>{children}</>;
  }

  return (
    <FeatureGateNotice
      feature={feature}
      requiredTier={getRequiredTier(feature)}
      onUpgrade={() => navigate("/membership")}
    />
  );
}
