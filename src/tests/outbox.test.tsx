import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "@/shared/lib/http/httpClient";
import { MemoryKeyValueStore } from "@/shared/lib/offline/keyValueStore";
import { Outbox, outbox } from "@/shared/lib/offline/outbox";
import { clearOfflineUser } from "@/shared/lib/offline/offlineCache";
import { executeOrQueue } from "@/shared/lib/mutations/offlineMutation";
import { OfflineBanner } from "@/shared/ui/OfflineBanner";

afterEach(() => vi.useRealTimers());

describe("offline outbox", () => {
  it("coalesces the latest intent per target and isolates users", async () => {
    const queue = new Outbox(new MemoryKeyValueStore());
    await queue.enqueue("alice", "group.join", "one");
    await queue.enqueue("alice", "group.join", "one");
    await queue.enqueue("alice", "group.leave", "one");
    await queue.enqueue("alice", "event.join", "one");
    await queue.enqueue("bob", "group.join", "one");
    expect((await queue.list("alice")).map((item) => item.kind)).toEqual(["group.leave", "event.join"]);
    await queue.wipe("alice");
    expect(await queue.list("alice")).toEqual([]);
    expect(await queue.list("bob")).toHaveLength(1);
  });

  it("flushes in order, stops on network failure, and resumes after backoff", async () => {
    vi.useFakeTimers();
    const queue = new Outbox(new MemoryKeyValueStore());
    await queue.enqueue("alice", "group.join", "one");
    await queue.enqueue("alice", "event.join", "two");
    const calls: string[] = [];
    let fail = true;
    const execute = vi.fn(async (item: { targetId: string }) => {
      calls.push(item.targetId);
      if (fail) throw new TypeError("offline");
    });
    await queue.flush("alice", { execute });
    expect(calls).toEqual(["one"]);
    expect((await queue.list("alice"))[0].attempts).toBe(1);
    fail = false;
    await queue.flush("alice", { execute });
    expect(calls).toEqual(["one"]);
    vi.advanceTimersByTime(1000);
    await queue.flush("alice", { execute });
    expect(calls).toEqual(["one", "one", "two"]);
    expect(await queue.list("alice")).toEqual([]);
  });

  it.each([[403, "not allowed"], [404, "no longer exists"], [409, "rejected"], [422, "rejected"]])("drops %i with notice", async (status, reason) => {
    const queue = new Outbox(new MemoryKeyValueStore());
    await queue.enqueue("alice", "group.join", "one");
    await queue.flush("alice", { execute: async () => { throw new HttpError("bad", status); } });
    expect(await queue.list("alice")).toEqual([]);
    expect(queue.state("alice").notices[0].reason).toContain(reason);
  });

  it("keeps 5xx failures and shows a notice after five attempts", async () => {
    vi.useFakeTimers();
    const queue = new Outbox(new MemoryKeyValueStore());
    await queue.enqueue("alice", "event.leave", "one");
    for (let count = 0; count < 5; count++) {
      await queue.flush("alice", { execute: async () => { throw new HttpError("server", 503); } });
      vi.advanceTimersByTime(60_000);
    }
    expect((await queue.list("alice"))[0]).toMatchObject({ attempts: 5, failed: true });
    expect(queue.state("alice").notices[0].reason).toContain("5 attempts");
  });

  it("wipes on 401 and queues only network failures", async () => {
    const queue = new Outbox(new MemoryKeyValueStore());
    await queue.enqueue("alice", "group.join", "one");
    await expect(queue.flush("alice", { execute: async () => { throw new HttpError("unauthorized", 401); } })).rejects.toMatchObject({ status: 401 });
    expect(await queue.list("alice")).toEqual([]);
    await expect(executeOrQueue("alice", "group.join", "one", async () => { throw new HttpError("forbidden", 403); })).rejects.toMatchObject({ status: 403 });
    expect(await outbox.list("alice")).toEqual([]);
    expect(await executeOrQueue("alice", "group.join", "one", async () => { throw new TypeError("offline"); })).toBe(true);
    expect(await outbox.list("alice")).toHaveLength(1);
    await clearOfflineUser("alice");
    expect(await outbox.list("alice")).toEqual([]);
  });

  it("shows queued counts and a dismissible failure notice", async () => {
    await outbox.enqueue("banner-user", "group.join", "one");
    render(<OfflineBanner userId="banner-user" />);
    expect(screen.getByRole("status")).toHaveTextContent("1 change waiting to sync");
    await act(async () => { await outbox.flush("banner-user", { execute: async () => { throw new HttpError("deleted", 404); } }); });
    expect(screen.getByRole("alert")).toHaveTextContent("no longer exists");
    await act(async () => { await outbox.wipe("banner-user"); });
  });
});
