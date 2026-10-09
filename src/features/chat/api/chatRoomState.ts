import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendRoomState {
  room_type: string;
  room_id: string;
  is_muted: boolean;
  unread_count?: number;
  last_read_message_id?: string | null;
  last_read_at?: string | null;
  success?: boolean;
}

export interface ChatRoomState {
  roomType: string;
  roomId: string;
  isMuted: boolean;
  unreadCount?: number;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
  success?: boolean;
}

function mapChatRoomState(state: BackendRoomState): ChatRoomState {
  return {
    roomType: state.room_type,
    roomId: state.room_id,
    isMuted: state.is_muted,
    unreadCount: state.unread_count,
    lastReadMessageId: state.last_read_message_id,
    lastReadAt: state.last_read_at,
    success: state.success,
  };
}

function groupRoomQuery(groupId: string) {
  return `room_type=group&room_id=${encodeURIComponent(groupId)}`;
}

export async function getGroupChatRoomState(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.get<BackendRoomState>(`/chat-rooms/state?${groupRoomQuery(groupId)}`));
}

export async function muteGroupChatRoom(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.put<BackendRoomState>("/chat-rooms/mute", {
    room_type: "group",
    room_id: groupId,
  }));
}

export async function unmuteGroupChatRoom(groupId: string): Promise<ChatRoomState> {
  return mapChatRoomState(await httpClient.delete<BackendRoomState>(`/chat-rooms/mute?${groupRoomQuery(groupId)}`));
}
