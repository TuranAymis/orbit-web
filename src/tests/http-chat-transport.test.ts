import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpChatTransport } from "@/features/chat/transport/httpChatTransport";

const backendMessage = {
  id: "msg_1",
  group_id: "grp_1",
  event_id: null,
  user_id: "user_2",
  username: "Free Orbit User",
  content: "hello from the backend",
  created_at: "2026-09-30T12:00:00Z",
};

describe("createHttpChatTransport", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts { group_id, content } to /chats, matching the backend ChatCreate schema", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(backendMessage), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await createHttpChatTransport().sendMessage({
      clientMessageId: "client_1",
      channelId: "grp_1",
      content: "hello from the backend",
      username: "Me",
      avatarFallback: "ME",
    } as never);

    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(url).toBe("http://localhost:8000/chats");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      group_id: "grp_1",
      content: "hello from the backend",
    });
  });

  it("maps the backend response (user_id, username, content) to a message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(backendMessage), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await createHttpChatTransport().sendMessage({
      clientMessageId: "client_1",
      channelId: "grp_1",
      content: "hello from the backend",
      username: "Me",
      avatarFallback: "ME",
    } as never);

    expect(result.message).toMatchObject({
      serverMessageId: "msg_1",
      channelId: "grp_1",
      userId: "user_2",
      username: "Free Orbit User",
      content: "hello from the backend",
      status: "sent",
    });
  });
});
