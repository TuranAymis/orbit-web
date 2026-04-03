import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import * as settingsApi from "@/features/settings/get-settings/api/getSettings";
import { useSettings } from "@/features/settings/get-settings/model/useSettings";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders queryClient={queryClient}>{children}</AppProviders>;
  };
}

describe("useSettings", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns mapped settings data", async () => {
    vi.spyOn(settingsApi, "getSettings").mockResolvedValue({
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      profileVisibility: "members",
      themePreference: "dark",
      language: "en",
    });

    const { result } = renderHook(() => useSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.themePreference).toBe("dark");
    expect(result.current.data?.profileVisibility).toBe("members");
  });
});
