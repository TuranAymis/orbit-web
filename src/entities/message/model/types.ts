export type MessageStatus = "sending" | "sent" | "failed";

export interface Message {
  id: string;
  clientMessageId: string;
  serverMessageId?: string;
  channelId: string;
  userId: string;
  username: string;
  avatarFallback: string;
  content: string;
  createdAt: string;
  type: "text" | "file" | "system";
  status: MessageStatus;
  canRetry?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  kind: "channel" | "dm";
  unreadCount?: number;
}

export interface Member {
  id: string;
  name: string;
  avatarFallback: string;
  status: "online" | "offline" | "away";
  role?: string;
}
