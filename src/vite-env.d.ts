/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ORBIT_API_URL?: string;
  readonly VITE_ORBIT_SOCKET_URL?: string;
  readonly VITE_ORBIT_CHAT_TRANSPORT?: "mock" | "socket" | "http";
  readonly VITE_ORBIT_CHAT_SOCKET_PATH?: string;
  readonly VITE_ORBIT_CHAT_SOCKET_NAMESPACE?: string;
  readonly VITE_ORBIT_CHAT_SEND_EVENT?: string;
  readonly VITE_ORBIT_CHAT_MESSAGE_EVENT?: string;
  readonly VITE_ORBIT_CHAT_ACK_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
