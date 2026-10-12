import { render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/shared/lib/http/httpClient";
import { clearStoredSession, AUTH_STORAGE_KEY } from "@/features/auth/auth-storage";
import { readThrough, clearOfflineUser, DATA_VERSION } from "@/shared/lib/offline/offlineCache";
import { MemoryKeyValueStore } from "@/shared/lib/offline/keyValueStore";
import { clearOfflineStatus, getOfflineStatus } from "@/shared/lib/offline/offlineStatus";
import { OfflineBanner } from "@/shared/ui/OfflineBanner";

const networkError = () => new TypeError("Failed to fetch");
const options = (store: MemoryKeyValueStore, userId = "alice") => ({ userId, key: "groups:list", store });

describe("offline cache", () => {
  beforeEach(() => { clearOfflineStatus(); window.localStorage.clear(); vi.useRealTimers(); });

  it("stores successful reads and serves a saved copy on network failure", async () => {
    const store = new MemoryKeyValueStore();
    await expect(readThrough({ ...options(store), fetcher: async () => ["group"] })).resolves.toEqual(["group"]);
    expect(await store.keys()).toEqual(["user:alice:groups:list"]);
    await expect(readThrough({ ...options(store), fetcher: async () => { throw networkError(); } })).resolves.toEqual(["group"]);
    expect(getOfflineStatus()).toMatchObject({ isOffline: true, stale: true, savedAt: expect.any(Number) });
    await readThrough({ ...options(store), fetcher: async () => ["fresh"] });
    expect(getOfflineStatus().stale).toBe(false);
  });

  it("never serves a cached copy for HTTP errors", async () => {
    const store = new MemoryKeyValueStore();
    await readThrough({ ...options(store), fetcher: async () => "saved" });
    for (const status of [401, 500]) {
      const error = new HttpError("HTTP error", status);
      await expect(readThrough({ ...options(store), fetcher: async () => { throw error; } })).rejects.toBe(error);
    }
    expect(getOfflineStatus().stale).toBe(false);
  });

  it("expires old records and ignores changed data versions", async () => {
    const store = new MemoryKeyValueStore();
    await store.put("user:alice:groups:list", { data: "old", savedAt: Date.now() - 1000, version: DATA_VERSION });
    await expect(readThrough({ ...options(store), ttlMs: 100, fetcher: async () => { throw networkError(); } })).rejects.toBeInstanceOf(TypeError);
    await store.put("user:alice:groups:list", { data: "old", savedAt: Date.now(), version: DATA_VERSION - 1 });
    await expect(readThrough({ ...options(store), fetcher: async () => { throw networkError(); } })).rejects.toBeInstanceOf(TypeError);
    expect(await store.keys()).toEqual([]);
  });

  it("isolates users and wipes only the signed-out user's data", async () => {
    const store = new MemoryKeyValueStore();
    await readThrough({ ...options(store), fetcher: async () => "alice data" });
    await readThrough({ ...options(store, "bob"), fetcher: async () => "bob data" });
    await expect(readThrough({ ...options(store, "bob"), fetcher: async () => { throw networkError(); } })).resolves.toBe("bob data");
    await clearOfflineUser("alice", store);
    expect(await store.keys()).toEqual(["user:bob:groups:list"]);
  });

  it("clears the global cache on logout", async () => {
    const { offlineStore } = await import("@/shared/lib/offline/keyValueStore");
    await offlineStore.put("user:alice:groups:list", { data: "saved", savedAt: Date.now(), version: DATA_VERSION });
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, accessToken: "token", user: { id: "alice", name: "Alice", email: "a@b.test", membershipTier: "Core", role: "user", avatarFallback: "A" } }));
    clearStoredSession();
    await vi.waitFor(async () => expect(await offlineStore.keys()).not.toContain("user:alice:groups:list"));
  });

  it("clears stale status on the online event and renders the banner only while stale", async () => {
    const store = new MemoryKeyValueStore();
    render(<OfflineBanner />);
    expect(screen.queryByRole("status")).toBeNull();
    await readThrough({ ...options(store), fetcher: async () => "saved" });
    await act(async () => { await readThrough({ ...options(store), fetcher: async () => { throw networkError(); } }); });
    expect(screen.getByRole("status")).toHaveTextContent(/showing data saved/i);
    act(() => window.dispatchEvent(new Event("online")));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
