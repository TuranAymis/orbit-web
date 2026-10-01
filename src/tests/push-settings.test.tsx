import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PushSettings } from "@/features/notifications/push/PushSettings";

afterEach(() => vi.unstubAllGlobals());
it("handles unsupported push and saves a category preference", async () => {
  vi.stubGlobal("Notification", undefined);
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ chat: true, event: true, group: true }), { headers: { "Content-Type": "application/json" } }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PushSettings />);
  expect(screen.getByText("Bu tarayıcı push bildirimlerini desteklemiyor.")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Sohbet"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect(fetchMock.mock.calls[1][0]).toContain("/notifications/preferences/chat");
});
it("subscribes only after explicit permission and posts the browser subscription", async () => {
  const subscribe = vi.fn().mockResolvedValue({ toJSON: () => ({ endpoint: "https://push.example/sub", keys: { p256dh: "key", auth: "auth" } }) });
  const register = vi.fn().mockResolvedValue({ pushManager: { subscribe } });
  vi.stubGlobal("navigator", { ...navigator, serviceWorker: { register } });
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("Notification", { permission: "default", requestPermission: vi.fn().mockResolvedValue("granted") });
  const fetchMock = vi.fn((url: string) => {
    const result = url.endsWith("/preferences")
      ? { chat: true, event: true, group: true }
      : url.endsWith("/config")
        ? { public_key: "AQID" }
        : { id: "subscription_1" };
    return Promise.resolve(new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } }));
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<PushSettings />);
  expect(register).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Bildirimleri aç"));
  await waitFor(() => expect(subscribe).toHaveBeenCalledOnce());
  expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith("/notifications/push/subscriptions"))).toBe(true);
});
