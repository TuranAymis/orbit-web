export type MessageStatus = "sending" | "sent" | "failed";

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatarFallback: string;
  content: string;
  createdAt: string;
  type: "text" | "file" | "system";
  status: MessageStatus;
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
