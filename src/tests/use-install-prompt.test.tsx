import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInstallPrompt } from "@/shared/lib/pwa/useInstallPrompt";

function InstallControl() {
  const { canInstall, promptInstall } = useInstallPrompt();
  return <button disabled={!canInstall} onClick={() => void promptInstall()}>Install app</button>;
}

afterEach(() => act(() => window.dispatchEvent(new Event("appinstalled"))));

describe("useInstallPrompt", () => {
  it("captures and consumes beforeinstallprompt", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    const user = userEvent.setup();
    render(<InstallControl />);
    expect(screen.getByRole("button")).toBeDisabled();
    act(() => window.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole("button")).toBeEnabled();
    await user.click(screen.getByRole("button"));
    expect(prompt).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
