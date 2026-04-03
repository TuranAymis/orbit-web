export type ChatTransportMode = "mock" | "socket" | "http";

export interface AppConfig {
  apiUrl: string;
  apiBaseUrl: string;
  socketUrl: string;
  chatTransportMode: ChatTransportMode;
  chatSocketPath: string;
  chatSocketNamespace: string;
  chatSendEvent: string;
  chatMessageEvent: string;
  chatAckTimeoutMs: number;
  isDevelopment: boolean;
}

const defaultTransportMode: ChatTransportMode =
  import.meta.env.MODE === "test" ? "mock" : "http";

const apiUrl = import.meta.env.VITE_ORBIT_API_URL ?? "http://localhost:8000";
const socketUrl = import.meta.env.VITE_ORBIT_SOCKET_URL ?? "http://localhost:8000";

export const appConfig: AppConfig = {
  apiUrl,
  apiBaseUrl: apiUrl,
  socketUrl,
  chatTransportMode:
    (import.meta.env.VITE_ORBIT_CHAT_TRANSPORT as ChatTransportMode | undefined) ??
    defaultTransportMode,
  chatSocketPath:
    import.meta.env.VITE_ORBIT_CHAT_SOCKET_PATH ?? "/socket.io",
  chatSocketNamespace:
    import.meta.env.VITE_ORBIT_CHAT_SOCKET_NAMESPACE ?? "/chat",
  chatSendEvent:
    import.meta.env.VITE_ORBIT_CHAT_SEND_EVENT ?? "chat:message:send",
  chatMessageEvent:
    import.meta.env.VITE_ORBIT_CHAT_MESSAGE_EVENT ?? "chat:message",
  chatAckTimeoutMs: Number(import.meta.env.VITE_ORBIT_CHAT_ACK_TIMEOUT_MS ?? 8000),
  isDevelopment: import.meta.env.DEV,
};
