import type { Message } from "@/entities/message/model/types";
import type { ChatConnectionStatus, ChatTransport, ChatTypingEvent, TransportOutgoingMessage } from "@/features/chat/transport/chatTransport";
import { httpClient } from "@/shared/lib/http/httpClient";

interface ServerMessage {
  id: string;
  group_id?: string | null;
  event_id?: string | null;
  user_id: string;
  username?: string | null;
  content: string;
  created_at: string;
}
interface ServerEvent {
  event: string;
  request_id?: string;
  data: ServerMessage | { success?: boolean; message?: ServerMessage; messages?: ServerMessage[]; error?: string };
}

export function createWebSocketChatTransport(apiUrl: string, token?: string): ChatTransport {
  const rooms = new Set<string>();
  const lastSeen = new Map<string, string>();
  const seen = new Set<string>();
  const messageListeners = new Set<(message: Message) => void>();
  const statusListeners = new Set<(status: ChatConnectionStatus) => void>();
  const typingListeners = new Set<(event: ChatTypingEvent) => void>();
  const pending = new Map<string, { resolve: (message: Message) => void; reject: (error: Error) => void }>();
  let socket: WebSocket | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let attempts = 0;
  let stopped = false;
  let sequence = 0;

  const status = (value: ChatConnectionStatus) => statusListeners.forEach((listener) => listener(value));
  const send = (event: string, data: object, requestId?: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, data, request_id: requestId }));
    }
  };
  const mapMessage = (raw: ServerMessage, clientMessageId?: string): Message => ({
    id: raw.id, serverMessageId: raw.id, clientMessageId: clientMessageId ?? raw.id,
    channelId: raw.event_id ?? raw.group_id ?? "", userId: raw.user_id,
    username: raw.username ?? "Orbit Member", avatarFallback: (raw.username ?? "OM").slice(0, 2).toUpperCase(),
    content: raw.content, createdAt: raw.created_at, type: "text", status: "sent", canRetry: false,
  });
  const deliver = (raw: ServerMessage) => {
    if (seen.has(raw.id)) return;
    seen.add(raw.id);
    const message = mapMessage(raw);
    lastSeen.set(message.channelId, message.id);
    messageListeners.forEach((listener) => listener(message));
  };
  const syncRoom = async (room: string) => {
    const cursor = lastSeen.get(room);
    try {
      const rows = await httpClient.get<ServerMessage[]>(`/chats?group_id=${encodeURIComponent(room)}${cursor ? `&after_id=${encodeURIComponent(cursor)}` : ""}`);
      rows.forEach(deliver);
    } catch {
      status("reconnecting");
    }
  };
  const connect = () => {
    if (stopped || socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;
    status(attempts ? "reconnecting" : "connecting");
    const url = new URL(apiUrl.replace(/^http/, "ws"));
    url.pathname = `${url.pathname.replace(/\/$/, "")}/ws/chat`;
    if (token) url.searchParams.set("token", token);
    socket = new WebSocket(url.toString());
    socket.onopen = () => {
      attempts = 0;
      status("connected");
      rooms.forEach((room) => {
        send("chat:join", { group_id: room });
        void syncRoom(room);
      });
      heartbeat = setInterval(() => send("chat:ping", {}), 25_000);
    };
    socket.onmessage = (event: MessageEvent<string>) => {
      let payload: ServerEvent;
      try { payload = JSON.parse(event.data) as ServerEvent; } catch { return; }
      if (payload.event === "chat:ping") { send("chat:pong", {}); return; }
      if (payload.event === "chat:message") { deliver(payload.data as ServerMessage); return; }
      if (payload.event === "chat:sync") {
        const rows = (payload.data as { messages?: ServerMessage[] }).messages ?? [];
        rows.forEach(deliver);
      }
      if (payload.event === "chat:ack" && payload.request_id) {
        const waiter = pending.get(payload.request_id);
        if (!waiter) return;
        pending.delete(payload.request_id);
        const data = payload.data as { success?: boolean; message?: ServerMessage; error?: string };
        if (data.success && data.message) waiter.resolve(mapMessage(data.message, payload.request_id));
        else waiter.reject(new Error(data.error ?? "Mesaj gönderilemedi"));
      }
    };
    socket.onclose = (event) => {
      if (heartbeat) clearInterval(heartbeat);
      socket = undefined;
      pending.forEach((waiter) => waiter.reject(new Error("Bağlantı kesildi")));
      pending.clear();
      if (stopped || event.code === 1008) { stopped = true; status("disconnected"); return; }
      status("reconnecting");
      timer = setTimeout(connect, Math.min(30_000, 500 * 2 ** Math.min(attempts++, 6)));
    };
    socket.onerror = () => socket?.close();
  };
  return {
    connect() { stopped = false; connect(); },
    disconnect() { stopped = true; if (timer) clearTimeout(timer); if (heartbeat) clearInterval(heartbeat); socket?.close(); socket = undefined; status("disconnected"); },
    joinRoom(room) { rooms.add(room); send("chat:join", { group_id: room }); void syncRoom(room); },
    leaveRoom(room) { rooms.delete(room); send("chat:leave", { group_id: room }); },
    sendMessage(message: TransportOutgoingMessage) {
      if (socket?.readyState !== WebSocket.OPEN) return Promise.reject(new Error("Sohbet bağlantısı yok"));
      const requestId = message.clientMessageId || String(++sequence);
      return new Promise<Message>((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        send("chat:send", { group_id: message.channelId, content: message.content }, requestId);
      }).then((resolved) => ({ clientMessageId: requestId, message: resolved }));
    },
    emitTyping() {},
    subscribeToMessages(listener) { messageListeners.add(listener); return () => { messageListeners.delete(listener); }; },
    subscribeToTyping(listener) { typingListeners.add(listener); return () => { typingListeners.delete(listener); }; },
    subscribeToConnectionStatus(listener) { statusListeners.add(listener); return () => { statusListeners.delete(listener); }; },
  };
}
