import type {
  Membership,
  MembershipFeature,
  MembershipTier,
} from "@/entities/membership/model/types";

const featureAccessMatrix: Record<MembershipFeature, MembershipTier[]> = {
  privateGroups: ["premium"],
  advancedChat: ["premium"],
  premiumEvents: ["premium"],
  prioritySupport: ["premium"],
};

export function hasMembershipAccess(
  membership: Pick<Membership, "tier"> | null | undefined,
  feature: MembershipFeature,
): boolean {
  const tier = membership?.tier ?? "free";

  return featureAccessMatrix[feature].includes(tier);
}

export function getRequiredTier(feature: MembershipFeature): MembershipTier {
  return featureAccessMatrix[feature][0] ?? "premium";
}
