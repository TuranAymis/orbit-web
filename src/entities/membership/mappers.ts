import type {
  Membership,
  MembershipStatus,
  MembershipTier,
} from "@/entities/membership/model/types";

interface MembershipResponse {
  tier?: string;
  membership_level?: string;
  status?: string;
  renewsAt?: string | null;
  startedAt?: string | null;
  benefits?: unknown;
  limits?: {
    groupJoinsPerMonth?: number | null;
    eventRsvpsPerMonth?: number | null;
    storageGb?: number | null;
  } | null;
}

function mapTier(tier?: string): MembershipTier {
  const normalizedTier = tier?.toLowerCase();
  return normalizedTier === "premium" ? "premium" : "free";
}

function mapStatus(status?: string): MembershipStatus {
  switch (status) {
    case "trialing":
    case "past_due":
    case "canceled":
      return status;
    default:
      return "active";
  }
}

export function mapMembershipResponse(payload: unknown): Membership {
  const response = (payload ?? {}) as MembershipResponse;

  return {
    tier: mapTier(response.tier ?? response.membership_level),
    status: mapStatus(response.status),
    renewsAt: response.renewsAt ?? null,
    startedAt: response.startedAt ?? null,
    benefits: Array.isArray(response.benefits)
      ? response.benefits.filter((item): item is string => typeof item === "string")
      : [],
    limits: {
      groupJoinsPerMonth: response.limits?.groupJoinsPerMonth ?? null,
      eventRsvpsPerMonth: response.limits?.eventRsvpsPerMonth ?? null,
      storageGb: response.limits?.storageGb ?? null,
    },
  };
}
