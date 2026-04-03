export type ChatTransportMode = "mock" | "socket";

interface OrbitRuntimeConfig {
  chatTransportMode: ChatTransportMode;
  chatSocketUrl: string;
  chatSocketPath: string;
  chatSocketNamespace: string;
  chatSendEvent: string;
  chatMessageEvent: string;
  chatAckTimeoutMs: number;
}

const defaultTransportMode: ChatTransportMode =
  import.meta.env.MODE === "test" ? "mock" : "socket";

export const orbitRuntimeConfig: OrbitRuntimeConfig = {
  chatTransportMode:
    (import.meta.env.VITE_ORBIT_CHAT_TRANSPORT as ChatTransportMode | undefined) ??
    defaultTransportMode,
  chatSocketUrl:
    import.meta.env.VITE_ORBIT_CHAT_SOCKET_URL ?? "http://localhost:3000",
  chatSocketPath:
    import.meta.env.VITE_ORBIT_CHAT_SOCKET_PATH ?? "/socket.io",
  chatSocketNamespace:
    import.meta.env.VITE_ORBIT_CHAT_SOCKET_NAMESPACE ?? "/chat",
  chatSendEvent:
    import.meta.env.VITE_ORBIT_CHAT_SEND_EVENT ?? "chat:message:send",
  chatMessageEvent:
    import.meta.env.VITE_ORBIT_CHAT_MESSAGE_EVENT ?? "chat:message",
  chatAckTimeoutMs: Number(import.meta.env.VITE_ORBIT_CHAT_ACK_TIMEOUT_MS ?? 8000),
};
