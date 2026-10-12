import { HttpError } from "@/shared/lib/http/httpClient";
import { offlineStore, type KeyValueStore } from "@/shared/lib/offline/keyValueStore";

export type OutboxKind = "group.join" | "group.leave" | "event.join" | "event.leave";
export interface OutboxItem {
  id: string;
  userId: string;
  kind: OutboxKind;
  targetId: string;
  createdAt: number;
  attempts: number;
  lastError?: string;
  retryAt?: number;
  failed?: boolean;
}
export interface OutboxNotice { id: string; kind: OutboxKind; targetId: string; reason: string }
export interface OutboxState { count: number; notices: OutboxNotice[]; synced: boolean; savedOffline: boolean }
export interface FlushDeps { execute: (item: OutboxItem) => Promise<unknown>; onSuccess?: (item: OutboxItem) => void | Promise<void>; onDrop?: (item: OutboxItem) => void | Promise<void>; now?: () => number }

const key = (userId: string) => `user:${encodeURIComponent(userId)}:outbox`;
const MAX_ATTEMPTS = 5;
const BACKOFF_MS = 1000;
export const OFFLINE_SAVED_MESSAGE = "Saved offline — will sync when you're back online";
export function isNetworkFailure(error: unknown): boolean {
  return !(error instanceof HttpError) && !(typeof error === "object" && error !== null && "status" in error) &&
    (error instanceof TypeError || (typeof navigator !== "undefined" && navigator.onLine === false));
}

export class Outbox {
  private listeners = new Set<() => void>();
  private states = new Map<string, OutboxState>();
  private locks = new Map<string, Promise<unknown>>();
  private flushes = new Map<string, Promise<void>>();
  private generations = new Map<string, number>();
  private emptyState: OutboxState = { count: 0, notices: [], synced: false, savedOffline: false };
  constructor(private store: KeyValueStore = offlineStore) {}

  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  state = (userId: string): OutboxState => this.states.get(userId) ?? this.emptyState;
  private publish(userId: string, state: OutboxState) { this.states.set(userId, state); this.listeners.forEach((listener) => listener()); }
  private locked<T>(userId: string, task: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(userId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(task);
    this.locks.set(userId, next);
    void next.finally(() => { if (this.locks.get(userId) === next) this.locks.delete(userId); }).catch(() => undefined);
    return next;
  }
  private async read(userId: string): Promise<{ items: OutboxItem[]; notices: OutboxNotice[] }> {
    return await this.store.get(key(userId)) ?? { items: [], notices: [] };
  }
  private async save(userId: string, data: { items: OutboxItem[]; notices: OutboxNotice[] }, extra: Partial<OutboxState> = {}) {
    await this.store.put(key(userId), data);
    this.publish(userId, { ...this.state(userId), count: data.items.filter((item) => !item.failed).length, notices: data.notices, ...extra });
  }
  async load(userId: string) { const data = await this.read(userId); this.publish(userId, { ...this.state(userId), count: data.items.filter((item) => !item.failed).length, notices: data.notices }); }
  async list(userId: string) { return (await this.read(userId)).items.sort((a, b) => a.createdAt - b.createdAt); }
  async enqueue(userId: string, kind: OutboxKind, targetId: string): Promise<OutboxItem> {
    return this.locked(userId, async () => {
      const generation = this.generations.get(userId) ?? 0;
      const data = await this.read(userId);
      const family = kind.split(".")[0];
      const existing = data.items.find((item) => item.kind.split(".")[0] === family && item.targetId === targetId);
      const item: OutboxItem = { id: crypto.randomUUID(), userId, kind, targetId, createdAt: Date.now(), attempts: 0 };
      data.items = data.items.filter((entry) => entry !== existing);
      data.items.push(item);
      if (existing?.failed) data.notices = data.notices.filter((notice) => notice.id !== existing.id);
      if (generation === (this.generations.get(userId) ?? 0)) await this.save(userId, data, { savedOffline: true, synced: false });
      return item;
    });
  }
  async remove(userId: string, id: string) {
    await this.locked(userId, async () => { const data = await this.read(userId); data.items = data.items.filter((item) => item.id !== id); await this.save(userId, data); });
  }
  async dismiss(userId: string, id: string) {
    await this.locked(userId, async () => { const data = await this.read(userId); data.notices = data.notices.filter((notice) => notice.id !== id); await this.save(userId, data); });
  }
  clearTransient(userId: string) {
    this.publish(userId, { ...this.state(userId), synced: false, savedOffline: false });
  }
  async wipe(userId: string) {
    this.generations.set(userId, (this.generations.get(userId) ?? 0) + 1);
    await this.locked(userId, async () => { await this.store.delete(key(userId)); this.publish(userId, { count: 0, notices: [], synced: false, savedOffline: false }); });
  }
  flush(userId: string, deps: FlushDeps): Promise<void> {
    const active = this.flushes.get(userId);
    if (active) return active;
    const promise = this.runFlush(userId, deps).finally(() => { this.flushes.delete(userId); });
    this.flushes.set(userId, promise);
    return promise;
  }
  private async runFlush(userId: string, deps: FlushDeps) {
    const generation = this.generations.get(userId) ?? 0;
    const now = deps.now ?? Date.now;
    let synced = false;
    for (const candidate of await this.list(userId)) {
      if (generation !== (this.generations.get(userId) ?? 0)) return;
      const item = (await this.list(userId)).find((entry) => entry.id === candidate.id);
      if (!item || item.failed) continue;
      if (item.retryAt && item.retryAt > now()) break;
      try {
        await deps.execute(item);
        if (generation !== (this.generations.get(userId) ?? 0)) return;
        await this.remove(userId, item.id);
        synced = true;
        await deps.onSuccess?.(item);
      } catch (error) {
        if (generation !== (this.generations.get(userId) ?? 0)) return;
        if (error instanceof HttpError && error.status === 401) {
          await this.wipe(userId);
          throw error;
        }
        const network = isNetworkFailure(error);
        const status = error instanceof HttpError ? error.status : undefined;
        await this.locked(userId, async () => {
          const data = await this.read(userId);
          const current = data.items.find((entry) => entry.id === item.id);
          if (!current) return;
          if (network || status === undefined || status >= 500) {
            current.attempts++;
            current.lastError = error instanceof Error ? error.message : "Sync failed";
            current.retryAt = now() + Math.min(60_000, BACKOFF_MS * 2 ** (current.attempts - 1));
            if (current.attempts >= MAX_ATTEMPTS) {
              current.failed = true;
              data.notices.push({ id: current.id, kind: current.kind, targetId: current.targetId, reason: `Sync failed after ${MAX_ATTEMPTS} attempts: ${current.lastError}` });
            }
          } else {
            data.items = data.items.filter((entry) => entry.id !== current.id);
            const reason = status === 404 ? "no longer exists" : status === 403 ? "not allowed" : `rejected (${status})`;
            data.notices.push({ id: current.id, kind: current.kind, targetId: current.targetId, reason });
          }
          await this.save(userId, data);
        });
        if ((!network && status !== undefined && status < 500) ||
            (await this.list(userId)).find((entry) => entry.id === item.id)?.failed) await deps.onDrop?.(item);
        if (network || status === undefined || status >= 500) break;
      }
    }
    if (synced) this.publish(userId, { ...this.state(userId), synced: true, savedOffline: false });
  }
}

export const outbox = new Outbox();
