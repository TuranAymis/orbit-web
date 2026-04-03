import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";

function MutationFeedbackHarness({ error }: { error: Error | null }) {
  const { message, clearMessage } = useMutationFeedback(error);

  return (
    <div>
      {message ? <p>{message}</p> : <p>No message</p>}
      <Button onClick={clearMessage}>Dismiss</Button>
    </div>
  );
}

describe("useMutationFeedback", () => {
  it("surfaces and clears a mutation failure message", async () => {
    const user = userEvent.setup();

    render(<MutationFeedbackHarness error={new Error("Save failed")} />);

    expect(screen.getByText(/save failed/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(screen.getByText(/no message/i)).toBeInTheDocument();
  });
});
