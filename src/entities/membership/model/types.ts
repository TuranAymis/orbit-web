export type MembershipTier = "free" | "premium";

export type MembershipStatus = "active" | "trialing" | "past_due" | "canceled";

export type MembershipFeature =
  | "privateGroups"
  | "advancedChat"
  | "premiumEvents"
  | "prioritySupport";

export interface MembershipLimits {
  groupJoinsPerMonth: number | null;
  eventRsvpsPerMonth: number | null;
  storageGb: number | null;
}

export interface Membership {
  tier: MembershipTier;
  status: MembershipStatus;
  renewsAt: string | null;
  startedAt: string | null;
  benefits: string[];
  limits: MembershipLimits;
}
