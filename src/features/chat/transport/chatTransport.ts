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

export interface ChatTransport {
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: TransportOutgoingMessage) => Promise<ChatSendResult>;
  subscribeToMessages: (callback: (message: Message) => void) => () => void;
  subscribeToConnectionStatus: (
    callback: (status: ChatConnectionStatus) => void,
  ) => () => void;
}
