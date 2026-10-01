import { afterEach, describe, expect, it, vi } from "vitest";
import { createWebSocketChatTransport } from "@/features/chat/transport/webSocketChatTransport";

class FakeSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static instances: FakeSocket[] = [];
  readyState = 0;
  onopen?: () => void;
  onclose?: (event: CloseEvent) => void;
  onmessage?: (event: MessageEvent<string>) => void;
  onerror?: () => void;
  sent: string[] = [];
  constructor(public url: string) { FakeSocket.instances.push(this); }
  send(value: string) { this.sent.push(value); }
  close() { this.readyState = 3; this.onclose?.({ code: 1000 } as CloseEvent); }
  open() { this.readyState = 1; this.onopen?.(); }
  receive(value: object) { this.onmessage?.({ data: JSON.stringify(value) } as MessageEvent<string>); }
}

const message = { id: "m1", group_id: "g1", event_id: null, user_id: "u1", username: "Ada", content: "Merhaba", created_at: "2026-10-01T00:00:00Z" };

describe("native WebSocket transport", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); FakeSocket.instances = []; });
  it("authenticates, joins, acknowledges and suppresses duplicate broadcasts", async () => {
    vi.stubGlobal("WebSocket", FakeSocket);
    const transport = createWebSocketChatTransport("http://localhost:8000", "jwt");
    const received: string[] = [];
    transport.subscribeToMessages((item) => received.push(item.id));
    transport.connect();
    transport.joinRoom("g1");
    const socket = FakeSocket.instances[0];
    expect(socket.url).toContain("/ws/chat?token=jwt");
    socket.open();
    expect(socket.sent.some((item) => JSON.parse(item).event === "chat:join")).toBe(true);
    const pending = transport.sendMessage({ clientMessageId: "c1", channelId: "g1", content: "Merhaba" } as never);
    socket.receive({ event: "chat:ack", request_id: "c1", data: { success: true, message } });
    expect((await pending).message.serverMessageId).toBe("m1");
    socket.receive({ event: "chat:message", data: message });
    socket.receive({ event: "chat:message", data: message });
    expect(received).toEqual(["m1"]);
    transport.disconnect();
  });
  it("reconnects and resumes with last message id", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", FakeSocket);
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchSpy);
    const transport = createWebSocketChatTransport("http://localhost:8000", "jwt");
    transport.connect();
    transport.joinRoom("g1");
    const first = FakeSocket.instances[0];
    first.open();
    first.receive({ event: "chat:message", data: message });
    first.close();
    await vi.advanceTimersByTimeAsync(500);
    const second = FakeSocket.instances[1];
    second.open();
    await Promise.resolve();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes("after_id=m1"))).toBe(true);
    transport.disconnect();
  });
});
