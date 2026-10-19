import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import type { AuthSession } from "@/features/auth/types";
import { useGroupDetail } from "@/features/groups/get-group-detail/model/useGroupDetail";
import * as detailApi from "@/features/groups/get-group-detail/api/getGroupDetail";
import * as joinApi from "@/features/groups/join-group/api/joinGroup";
import { HttpError } from "@/shared/lib/http/httpClient";
import { outbox } from "@/shared/lib/offline/outbox";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

const session: AuthSession = {
  isAuthenticated: true, accessToken: "token", tokenType: "bearer", expiresIn: 3600,
  user: { id: "offline-hook-user", name: "Offline", email: "offline@test.dev", membershipTier: "Core", role: "user", avatarFallback: "O" },
};
const group = {
  id: "group-one", name: "Group", description: "A group", imageUrl: "", coverImageUrl: "",
  memberCount: 1, isJoined: false, canCreateEvents: false, category: "General", location: "Online",
  founder: "Founder", stats: { weeklyPosts: 0, activeMembers: 1, upcomingEvents: 0 },
  upcomingEvents: [], galleryPreview: [], memberPreview: [],
};

afterEach(async () => { vi.restoreAllMocks(); await outbox.wipe(session.user.id); });

describe("offline membership mutations", () => {
  function setup() {
    const queryClient = createOrbitQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      <AppProviders queryClient={queryClient} initialSession={session}>{children}</AppProviders>;
    vi.spyOn(detailApi, "getGroupDetail").mockResolvedValue(group);
    return { queryClient, wrapper };
  }

  it("queues a network failure and retains optimistic membership", async () => {
    const { wrapper } = setup();
    vi.spyOn(joinApi, "joinGroup").mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useGroupDetail(group.id), { wrapper });
    await waitFor(() => expect(result.current.data).not.toBeNull());
    await act(async () => { await result.current.toggleMembership(); });
    await waitFor(() => expect(result.current.data?.isJoined).toBe(true));
    expect(result.current.membershipError).toBeNull();
    expect((await outbox.list(session.user.id))[0]).toMatchObject({ kind: "group.join", targetId: group.id });
  });

  it("does not queue a 4xx failure", async () => {
    const { wrapper } = setup();
    vi.spyOn(joinApi, "joinGroup").mockRejectedValue(new HttpError("Forbidden", 403));
    const { result } = renderHook(() => useGroupDetail(group.id), { wrapper });
    await waitFor(() => expect(result.current.data).not.toBeNull());
    await act(async () => { await expect(result.current.toggleMembership()).rejects.toMatchObject({ status: 403 }); });
    expect(result.current.data?.isJoined).toBe(false);
    expect(await outbox.list(session.user.id)).toEqual([]);
  });
});
