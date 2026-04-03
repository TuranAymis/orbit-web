import { describe, expect, it } from "vitest";
import {
  formatMembershipTierLabel,
  mapBackendMembershipLevelToTier,
  mapMembershipResponse,
} from "@/entities/membership/mappers";
import { mapProfileResponse } from "@/entities/user/mappers";

describe("membership mapping", () => {
  it('maps backend "paid" to frontend "premium"', () => {
    expect(mapBackendMembershipLevelToTier("paid")).toBe("premium");
    expect(formatMembershipTierLabel("premium")).toBe("Premium");
  });

  it('maps backend "free" to frontend "free"', () => {
    expect(mapBackendMembershipLevelToTier("free")).toBe("free");
    expect(formatMembershipTierLabel("free")).toBe("Free");
  });

  it('falls back safely to "free" for unknown or missing values', () => {
    expect(mapBackendMembershipLevelToTier("enterprise")).toBe("free");
    expect(mapBackendMembershipLevelToTier(undefined)).toBe("free");
    expect(mapBackendMembershipLevelToTier(null)).toBe("free");
  });

  it("maps membership responses from membership_level consistently", () => {
    expect(
      mapMembershipResponse({
        membership_level: "paid",
      }).tier,
    ).toBe("premium");
  });

  it("maps paid backend users to premium profile UI state", () => {
    expect(
      mapProfileResponse({
        id: "user_paid",
        email: "paid@orbit.dev",
        full_name: "Paid Orbit",
        membership_level: "paid",
      }).membershipTier,
    ).toBe("Premium");
  });
});
