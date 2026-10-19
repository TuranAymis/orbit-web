import { describe, expect, it } from "vitest";
import { mapChatMessage, mapChatMessages } from "@/entities/message/mappers";

const message = { id: "m1", group_id: "g1", user_id: "u1", username: "Ada", content: "Hello", created_at: "2026-10-20T10:00:00Z" };

describe("chat mappers", () => {
  it("maps backend snake_case fields in messages", () => {
    expect(mapChatMessage(message)).toMatchObject({ id: "m1", channelId: "g1", userId: "u1", createdAt: message.created_at });
  });

  it("accepts array and wrapped history responses", () => {
    expect(mapChatMessages([message])).toHaveLength(1);
    expect(mapChatMessages({ items: [message] })[0]?.id).toBe("m1");
    expect(mapChatMessages({ messages: [message] })[0]?.id).toBe("m1");
  });
});
