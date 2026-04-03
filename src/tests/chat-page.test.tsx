import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { ChatPage } from "@/pages/chat/ChatPage";
import type { AuthSession } from "@/features/auth/types";

const demoSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    avatarFallback: "DO",
  },
};

function renderChatPage() {
  return render(
    <AppProviders initialSession={demoSession}>
      <ChatPage />
    </AppProviders>,
  );
}

describe("ChatPage", () => {
  it("renders the 3-column layout with channels, messages, and members", () => {
    renderChatPage();

    expect(screen.getByRole("heading", { name: /orbit workspace chat/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /channels/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /members/i })).toBeInTheDocument();
    expect(screen.getByText(/online now/i)).toBeInTheDocument();
  });

  it("switches the active channel and updates visible messages", async () => {
    const user = userEvent.setup();
    renderChatPage();

    expect(screen.getByText(/deploy preview is ready for qa/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /release squad/i }));

    expect(screen.getByText(/release notes draft is ready for review/i)).toBeInTheDocument();
    expect(screen.queryByText(/deploy preview is ready for qa/i)).not.toBeInTheDocument();
  });

  it("sends a local message and clears the input", async () => {
    const user = userEvent.setup();
    renderChatPage();

    const input = screen.getByPlaceholderText(/message #general/i);
    await user.type(input, "I’ve pushed the updated onboarding copy.");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      screen.getByText(/i’ve pushed the updated onboarding copy/i),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("renders an empty state for channels without messages", async () => {
    const user = userEvent.setup();
    renderChatPage();

    await user.click(screen.getByRole("button", { name: /support desk/i }));

    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start the conversation in support desk/i)).toBeInTheDocument();
  });
});
