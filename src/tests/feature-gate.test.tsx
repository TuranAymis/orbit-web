import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FeatureGate } from "@/widgets/membership/FeatureGate";

describe("FeatureGate", () => {
  it("renders children when access is allowed", () => {
    render(
      <MemoryRouter>
        <FeatureGate
          feature="advancedChat"
          membership={{
            tier: "premium",
            status: "active",
            renewsAt: null,
            startedAt: null,
            benefits: [],
            limits: {
              groupJoinsPerMonth: null,
              eventRsvpsPerMonth: null,
              storageGb: null,
            },
          }}
        >
          <div>Premium chat tools</div>
        </FeatureGate>
      </MemoryRouter>,
    );

    expect(screen.getByText(/premium chat tools/i)).toBeInTheDocument();
  });

  it("renders an upgrade notice when access is denied", () => {
    render(
      <MemoryRouter>
        <FeatureGate
          feature="advancedChat"
          membership={{
            tier: "free",
            status: "active",
            renewsAt: null,
            startedAt: null,
            benefits: [],
            limits: {
              groupJoinsPerMonth: null,
              eventRsvpsPerMonth: null,
              storageGb: null,
            },
          }}
        >
          <div>Premium chat tools</div>
        </FeatureGate>
      </MemoryRouter>,
    );

    expect(screen.getByText(/upgrade to unlock this feature/i)).toBeInTheDocument();
    expect(screen.queryByText(/premium chat tools/i)).not.toBeInTheDocument();
  });
});
