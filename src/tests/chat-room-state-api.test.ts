import { afterEach, describe, expect, it, vi } from "vitest";
import { getGroupChatRoomState, muteGroupChatRoom, unmuteGroupChatRoom } from "@/features/chat/api/chatRoomState";
import { httpClient } from "@/shared/lib/http/httpClient";

afterEach(() => vi.restoreAllMocks());

describe("chat room state API", () => {
  it("reads and maps the backend room state", async () => {
    const get = vi.spyOn(httpClient, "get").mockResolvedValue({
      room_type: "group", room_id: "group 1", is_muted: true,
      unread_count: 3, last_read_message_id: "message-1", last_read_at: "2026-10-07T10:00:00Z",
    });
    expect(await getGroupChatRoomState("group 1")).toEqual({
      roomType: "group", roomId: "group 1", isMuted: true,
      unreadCount: 3, lastReadMessageId: "message-1", lastReadAt: "2026-10-07T10:00:00Z",
      success: undefined,
    });
    expect(get).toHaveBeenCalledWith("/chat-rooms/state?room_type=group&room_id=group%201");
  });

  it("uses PUT and DELETE for mute changes", async () => {
    const response = { room_type: "group", room_id: "group-1", is_muted: true, success: true };
    const put = vi.spyOn(httpClient, "put").mockResolvedValue(response);
    const remove = vi.spyOn(httpClient, "delete").mockResolvedValue({ ...response, is_muted: false });
    expect((await muteGroupChatRoom("group-1")).isMuted).toBe(true);
    expect((await unmuteGroupChatRoom("group-1")).isMuted).toBe(false);
    expect(put).toHaveBeenCalledWith("/chat-rooms/mute", { room_type: "group", room_id: "group-1" });
    expect(remove).toHaveBeenCalledWith("/chat-rooms/mute?room_type=group&room_id=group-1");
  });
});
