import { httpClient } from "@/shared/lib/http/httpClient";
import { mapChatRoomState, type BackendChatRoomState, type ChatRoomState } from "@/entities/message/mappers";
export type { ChatRoomState } from "@/entities/message/mappers";

function groupRoomQuery(groupId: string) {
  return `room_type=group&room_id=${encodeURIComponent(groupId)}`;
}

export async function getGroupChatRoomState(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.get<BackendChatRoomState>(`/chat-rooms/state?${groupRoomQuery(groupId)}`));
}

export async function muteGroupChatRoom(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.put<BackendChatRoomState>("/chat-rooms/mute", {
    room_type: "group",
    room_id: groupId,
  }));
}

export async function unmuteGroupChatRoom(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.delete<BackendChatRoomState>(`/chat-rooms/mute?${groupRoomQuery(groupId)}`));
}
