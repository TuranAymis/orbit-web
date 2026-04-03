import type { Message } from "@/entities/message/model/types";

export interface ChatTransport {
  sendMessage: (message: Message) => Promise<Message>;
  subscribeToMessages: (callback: (message: Message) => void) => void;
  unsubscribe: () => void;
}
