import type { Message } from "@/entities/message/model/types";
import { mapCollection } from "@/shared/lib/http/collectionMapper";

export interface BackendChatMessage {
  id: string;
  user_id: string;
  username?: string | null;
  group_id?: string | null;
  event_id?: string | null;
  content: string;
  created_at: string;
}

interface ChatMessageContext {
  channelId?: string;
  clientMessageId?: string;
  currentUser?: { id: string; name: string; avatarFallback: string } | null;
  fallbackUsername?: string;
  fallbackAvatar?: string;
}

export function mapChatMessage(raw: BackendChatMessage, context: ChatMessageContext = {}): Message {
  const ownMessage = raw.user_id === context.currentUser?.id;
  const username = ownMessage ? context.currentUser!.name : raw.username ?? context.fallbackUsername ?? "Orbit Member";
  return {
    id: raw.id,
    clientMessageId: context.clientMessageId ?? raw.id,
    serverMessageId: raw.id,
    channelId: raw.event_id ?? raw.group_id ?? context.channelId ?? "",
    userId: raw.user_id,
    username,
    avatarFallback: ownMessage
      ? context.currentUser!.avatarFallback
      : context.fallbackAvatar ?? username.slice(0, 2).toUpperCase(),
    content: raw.content,
    createdAt: raw.created_at,
    type: "text",
    status: "sent",
    canRetry: false,
  };
}

export function mapChatMessages(payload: unknown, context: ChatMessageContext = {}): Message[] {
  return mapCollection<BackendChatMessage>(payload, ["messages", "data"]).map((raw) => mapChatMessage(raw, context));
}

export interface BackendChatRoomState {
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

export function mapChatRoomState(state: BackendChatRoomState): ChatRoomState {
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
