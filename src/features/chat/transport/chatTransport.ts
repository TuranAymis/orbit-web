import type { Message } from "@/entities/message/model/types";

export interface ChatSendResult {
  clientMessageId: string;
  message: Message;
}

export interface ChatTransport {
  sendMessage: (message: Message) => Promise<ChatSendResult>;
  subscribeToMessages: (callback: (message: Message) => void) => () => void;
}
