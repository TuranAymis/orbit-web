import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function worker() {
  return { postMessage: vi.fn() } as unknown as ServiceWorker;
}

function serviceWorkerRegistration(waiting: ServiceWorker | null = null) {
  const listeners = new Map<string, EventListener>();
  const registration = {
    waiting,
    installing: null as ServiceWorker | null,
    addEventListener: vi.fn((type: string, listener: EventListener) => listeners.set(type, listener)),
  } as unknown as ServiceWorkerRegistration;
  return { registration, listeners };
}

beforeEach(() => { vi.resetModules(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("PWA registration", () => {
  it("does not register in tests or development", async () => {
    vi.stubEnv("PROD", false);
    const register = vi.fn();
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    const { registerServiceWorker } = await import("@/shared/lib/pwa/registerServiceWorker");
    await act(async () => { await registerServiceWorker(); });
    expect(register).not.toHaveBeenCalled();
  });

  it("detects a waiting update and applies it on request", async () => {
    vi.stubEnv("PROD", true);
    const waiting = worker();
    const { registration } = serviceWorkerRegistration(waiting);
    const register = vi.fn().mockResolvedValue(registration);
    const addEventListener = vi.fn();
    vi.stubGlobal("navigator", { serviceWorker: { register, controller: worker(), addEventListener } });
    const pwa = await import("@/shared/lib/pwa/registerServiceWorker");
    const callback = vi.fn();
    pwa.onUpdateAvailable(callback);
    await pwa.registerServiceWorker();
    expect(register).toHaveBeenCalledWith("/sw.js");
    expect(callback).toHaveBeenCalledOnce();
    pwa.applyUpdate();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
    expect(addEventListener).toHaveBeenCalledWith("controllerchange", expect.any(Function), { once: true });
  });

  it("shows the banner only for an update and wires Reload", async () => {
    vi.stubEnv("PROD", true);
    const waiting = worker();
    const { registration } = serviceWorkerRegistration(waiting);
    vi.stubGlobal("navigator", { serviceWorker: { register: vi.fn().mockResolvedValue(registration), controller: worker(), addEventListener: vi.fn() } });
    const { UpdateBanner } = await import("@/shared/ui/UpdateBanner");
    const { registerServiceWorker } = await import("@/shared/lib/pwa/registerServiceWorker");
    const user = userEvent.setup();
    render(<UpdateBanner />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    await act(async () => { await registerServiceWorker(); });
    expect(await screen.findByRole("status")).toHaveTextContent("A new version is available");
    await user.click(screen.getByRole("button", { name: "Reload" }));
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });
});
