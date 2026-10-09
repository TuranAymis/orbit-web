import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { AppProviders } from "@/app/providers/AppProviders";
import { appConfig } from "@/config/appConfig";
import type { Group } from "@/entities/group/model/types";
import type { AuthSession } from "@/features/auth/types";
import { useChat } from "@/features/chat/model/useChat";
import * as roomStateApi from "@/features/chat/api/chatRoomState";
import * as groupsApi from "@/features/groups/list-groups/api/listGroups";
import * as joinGroupApi from "@/features/groups/join-group/api/joinGroup";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import { ChatPage } from "@/pages/chat/ChatPage";
import { httpClient } from "@/shared/lib/http/httpClient";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

const session: AuthSession = {
  isAuthenticated: true,
  accessToken: "test-access-token",
  tokenType: "bearer",
  expiresIn: 3600,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    role: "user",
    avatarFallback: "DO",
  },
};

function group(id: string, isJoined: boolean): Group {
  return { id, name: id, description: "", memberCount: 1, imageUrl: "", isJoined };
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders initialSession={session} queryClient={createOrbitQueryClient()}>
      {children}
    </AppProviders>
  );
}

describe("live chat member channels", () => {
  beforeEach(() => {
    appConfig.chatTransportMode = "http";
  });

  afterEach(() => {
    appConfig.chatTransportMode = "mock";
    vi.restoreAllMocks();
  });

  it("lists only joined groups and requests the first member channel", async () => {
    vi.spyOn(groupsApi, "listGroups").mockResolvedValue([
      group("unjoined", false), group("member-one", true), group("member-two", true),
    ]);
    const get = vi.spyOn(httpClient, "get").mockResolvedValue([]);

    const { result } = renderHook(() => useChat(), { wrapper });

    await waitFor(() => expect(result.current.activeChannelId).toBe("member-one"));
    expect(result.current.channels.map((channel) => channel.id)).toEqual(["member-one", "member-two"]);
    await waitFor(() => expect(get).toHaveBeenCalledWith("/chats?group_id=member-one"));
    expect(get).not.toHaveBeenCalledWith("/chats?group_id=unjoined");
  });

  it("ignores a preferred group without active membership", async () => {
    vi.spyOn(groupsApi, "listGroups").mockResolvedValue([
      group("unjoined", false), group("member", true),
    ]);
    const get = vi.spyOn(httpClient, "get").mockResolvedValue([]);

    const { result } = renderHook(() => useChat({ preferredChannelId: "unjoined" }), { wrapper });

    await waitFor(() => expect(result.current.activeChannelId).toBe("member"));
    await waitFor(() => expect(get).toHaveBeenCalledWith("/chats?group_id=member"));
    expect(get).not.toHaveBeenCalledWith("/chats?group_id=unjoined");
  });

  it("keeps joined channels when one room-state request fails", async () => {
    vi.spyOn(groupsApi, "listGroups").mockResolvedValue([
      group("working", true), group("state-failed", true),
    ]);
    vi.spyOn(roomStateApi, "getGroupChatRoomState").mockImplementation(async (groupId) => {
      if (groupId === "state-failed") throw new Error("Room state unavailable");
      return { roomType: "group", roomId: groupId, isMuted: true };
    });
    vi.spyOn(httpClient, "get").mockResolvedValue([]);

    const { result } = renderHook(() => useChat(), { wrapper });

    await waitFor(() => expect(result.current.channels).toMatchObject([
      { id: "working", isMuted: true },
      { id: "state-failed", isMuted: false },
    ]));
    expect(result.current.error).toBeNull();
  });

  it("updates an open chat after joining a group", async () => {
    let joined = false;
    vi.spyOn(groupsApi, "listGroups").mockImplementation(async () => [
      group("existing", true), group("new", joined),
    ]);
    vi.spyOn(joinGroupApi, "joinGroup").mockImplementation(async () => { joined = true; });
    vi.spyOn(httpClient, "get").mockResolvedValue([]);
    const queryClient = createOrbitQueryClient();
    const sharedWrapper = ({ children }: { children: React.ReactNode }) => (
      <AppProviders initialSession={session} queryClient={queryClient}>{children}</AppProviders>
    );
    const { result } = renderHook(() => ({ chat: useChat(), join: useJoinGroup() }), {
      wrapper: sharedWrapper,
    });

    await waitFor(() => expect(result.current.chat.channels.map((channel) => channel.id)).toEqual(["existing"]));
    await act(async () => result.current.join.joinById("new"));
    await waitFor(() => expect(result.current.chat.channels.map((channel) => channel.id)).toEqual([
      "existing", "new",
    ]));
  });

  it("follows a changed preferred channel, then respects manual selection", async () => {
    vi.spyOn(groupsApi, "listGroups").mockResolvedValue([
      group("a", true), group("b", true), group("c", true),
    ]);
    vi.spyOn(httpClient, "get").mockResolvedValue([]);
    const { result, rerender } = renderHook(
      ({ preferredChannelId }) => useChat({ preferredChannelId }),
      { initialProps: { preferredChannelId: "a" }, wrapper },
    );

    await waitFor(() => expect(result.current.activeChannelId).toBe("a"));
    rerender({ preferredChannelId: "b" });
    await waitFor(() => expect(result.current.activeChannelId).toBe("b"));
    act(() => result.current.setActiveChannelId("c"));
    await waitFor(() => expect(result.current.activeChannelId).toBe("c"));
    rerender({ preferredChannelId: "b" });
    expect(result.current.activeChannelId).toBe("c");
  });

  it("shows a no-channel state without requesting chat history", async () => {
    vi.spyOn(groupsApi, "listGroups").mockResolvedValue([group("unjoined", false)]);
    const get = vi.spyOn(httpClient, "get").mockResolvedValue([]);

    render(
      <AppProviders initialSession={session} queryClient={createOrbitQueryClient()}>
        <ChatPage />
      </AppProviders>,
    );

    expect(await screen.findByText("No channels yet")).toBeInTheDocument();
    expect(screen.getByText("Join a group to start chatting.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(get).not.toHaveBeenCalledWith(expect.stringMatching(/^\/chats\?/));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Mesajlar yükleniyor…")).not.toBeInTheDocument();
  });
});
