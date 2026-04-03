import type {
  Membership,
  MembershipStatus,
  MembershipTier,
} from "@/entities/membership/model/types";
import { appConfig } from "@/config/appConfig";

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

export function mapBackendMembershipLevelToTier(level?: string | null): MembershipTier {
  const normalizedLevel = level?.trim().toLowerCase();
  const mappedTier =
    normalizedLevel === "premium" || normalizedLevel === "paid" ? "premium" : "free";

  if (appConfig.isDevelopment) {
    console.info("[orbit:membership] backend level -> tier", {
      rawMembershipLevel: level ?? null,
      mappedTier,
    });
  }

  return mappedTier;
}

export function formatMembershipTierLabel(tier: MembershipTier): string {
  return tier === "premium" ? "Premium" : "Free";
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
    tier: mapBackendMembershipLevelToTier(response.tier ?? response.membership_level),
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
