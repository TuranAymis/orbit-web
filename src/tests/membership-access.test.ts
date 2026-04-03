import { describe, expect, it } from "vitest";
import { getRequiredTier, hasMembershipAccess } from "@/entities/membership/access";

describe("membership access helper", () => {
  it("returns false for premium features on free plans", () => {
    expect(hasMembershipAccess({ tier: "free" }, "advancedChat")).toBe(false);
    expect(hasMembershipAccess({ tier: "free" }, "privateGroups")).toBe(false);
  });

  it("returns true for premium features on premium plans", () => {
    expect(hasMembershipAccess({ tier: "premium" }, "advancedChat")).toBe(true);
    expect(hasMembershipAccess({ tier: "premium" }, "premiumEvents")).toBe(true);
  });

  it("returns the required tier for gated features", () => {
    expect(getRequiredTier("prioritySupport")).toBe("premium");
  });
});
