import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as profileApi from "@/features/profile/get-profile/api/getProfile";
import { useProfile } from "@/features/profile/get-profile/model/useProfile";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders queryClient={queryClient}>{children}</AppProviders>;
  };
}

describe("useProfile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns mapped profile data", async () => {
    vi.spyOn(profileApi, "getProfile").mockResolvedValue({
      id: "user_demo",
      name: "Demo Orbit",
      email: "demo@orbit.dev",
      avatarUrl: null,
      bio: "Building communities with clear product systems.",
      location: "Istanbul",
      joinedAt: "2026-01-05T10:00:00.000Z",
      membershipTier: "Premium",
      stats: {
        groupsJoined: 14,
        eventsAttended: 6,
        messagesSent: 422,
      },
      activityPreview: [],
    });

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.name).toBe("Demo Orbit");
    expect(result.current.data?.membershipTier).toBe("Premium");
  });
});
