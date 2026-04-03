import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageList } from "@/widgets/chat/MessageList";
import type { Message } from "@/entities/message/model/types";

const messages: Message[] = [
  {
    id: "msg_1",
    channelId: "channel_general",
    userId: "user_demo",
    username: "Demo Orbit",
    avatarFallback: "DO",
    content: "Morning everyone, let’s align on the release checklist.",
    createdAt: "2026-04-03T09:30:00.000Z",
    type: "text",
    status: "sent",
  },
  {
    id: "msg_2",
    channelId: "channel_general",
    userId: "system",
    username: "Orbit System",
    avatarFallback: "OS",
    content: "Frontend Forge was created.",
    createdAt: "2026-04-03T09:31:00.000Z",
    type: "system",
    status: "sent",
  },
];

describe("MessageList", () => {
  it("renders the active channel messages", () => {
    render(<MessageList messages={messages} />);

    expect(
      screen.getByText(/morning everyone, let’s align on the release checklist/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/frontend forge was created/i)).toBeInTheDocument();
  });
});
