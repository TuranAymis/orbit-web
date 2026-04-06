import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import * as listEventsApi from "@/features/events/list-events/api/listEvents";
import { useEvents } from "@/features/events/list-events/model/useEvents";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

const validSession: AuthSession = {
  isAuthenticated: true,
  accessToken: "test-access-token",
  tokenType: "bearer",
  expiresIn: 3600,
  user: {
    id: "user_demo",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    role: "user",
    avatarFallback: "DO",
  },
};

function createWrapper(session?: AuthSession | null) {
  const queryClient = createOrbitQueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProviders queryClient={queryClient} initialSession={session ?? null}>
        {children}
      </AppProviders>
    );
  };
}

describe("protected query gating", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("does not run protected event queries without a valid authenticated session", async () => {
    const spy = vi.spyOn(listEventsApi, "listEvents").mockResolvedValue([]);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(null),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(spy).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it("runs protected event queries once a valid authenticated session exists", async () => {
    const spy = vi.spyOn(listEventsApi, "listEvents").mockResolvedValue([]);

    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(validSession),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(spy).toHaveBeenCalled();
  });
});
