import type { Message } from "@/entities/message/model/types";

export type ChatConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export interface TransportOutgoingMessage {
  clientMessageId: string;
  channelId: string;
  userId: string;
  username: string;
  avatarFallback: string;
  content: string;
  createdAt: string;
  type: Message["type"];
}

export interface TransportIncomingMessage {
  id: string;
  clientMessageId?: string;
  serverMessageId?: string;
  channelId: string;
  userId: string;
  username: string;
  avatarFallback: string;
  content: string;
  createdAt: string;
  type: Message["type"];
}

export interface ChatSendResult {
  clientMessageId: string;
  message: Message;
}

export interface ChatTypingEvent {
  channelId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface ChatTransport {
  connect: () => void;
  disconnect: () => void;
  joinRoom: (channelId: string) => void;
  leaveRoom: (channelId: string) => void;
  sendMessage: (message: TransportOutgoingMessage) => Promise<ChatSendResult>;
  emitTyping: (event: ChatTypingEvent) => void;
  subscribeToMessages: (callback: (message: Message) => void) => () => void;
  subscribeToTyping: (callback: (event: ChatTypingEvent) => void) => () => void;
  subscribeToConnectionStatus: (
    callback: (status: ChatConnectionStatus) => void,
  ) => () => void;
}
