import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageItem } from "@/widgets/chat/MessageItem";
import type { Message } from "@/entities/message/model/types";

const message: Message = {
  id: "msg_1",
  channelId: "channel_general",
  userId: "user_demo",
  username: "Demo Orbit",
  avatarFallback: "DO",
  content: "Pushed the latest shell refactor and everything is looking clean.",
  createdAt: "2026-04-03T09:30:00.000Z",
  type: "text",
  status: "sent",
};

describe("MessageItem", () => {
  it("renders avatar, username, timestamp, and content", () => {
    render(<MessageItem message={message} />);

    expect(screen.getByText("DO")).toBeInTheDocument();
    expect(screen.getByText(/demo orbit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/pushed the latest shell refactor and everything is looking clean/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/09:30/i)).toBeInTheDocument();
  });
});
