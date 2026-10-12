import { offlineStore, type KeyValueStore } from "@/shared/lib/offline/keyValueStore";
import { clearOfflineStatus, setOfflineStale } from "@/shared/lib/offline/offlineStatus";
import { outbox } from "@/shared/lib/offline/outbox";

export const DATA_VERSION = 1;
export const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheRecord<T> { data: T; savedAt: number; version: number }
interface ReadThroughOptions<T> {
  userId: string | null;
  key: string;
  ttlMs?: number;
  fetcher: () => Promise<T>;
  store?: KeyValueStore;
}

const namespace = (userId: string) => `user:${encodeURIComponent(userId)}:`;
const revoked = new Map<string, number>();

function isNetworkError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "status" in error && typeof error.status === "number") return false;
  return error instanceof TypeError ||
    (typeof navigator !== "undefined" && navigator.onLine === false);
}

export async function readThrough<T>({ userId, key, ttlMs = DEFAULT_TTL_MS, fetcher, store = offlineStore }: ReadThroughOptions<T>): Promise<T> {
  const generation = userId ? revoked.get(userId) ?? 0 : 0;
  try {
    const data = await fetcher();
    if (userId && generation === (revoked.get(userId) ?? 0)) {
      await store.put<CacheRecord<T>>(`${namespace(userId)}${key}`, { data, savedAt: Date.now(), version: DATA_VERSION });
    }
    clearOfflineStatus();
    return data;
  } catch (error) {
    if (!userId || !isNetworkError(error) || generation !== (revoked.get(userId) ?? 0)) throw error;
    const storageKey = `${namespace(userId)}${key}`;
    const cached = await store.get<CacheRecord<T>>(storageKey);
    if (cached && cached.version !== DATA_VERSION) {
      await store.delete(storageKey);
      throw error;
    }
    if (cached && Number.isFinite(cached.savedAt) && Date.now() - cached.savedAt <= ttlMs && cached.savedAt <= Date.now()) {
      setOfflineStale(cached.savedAt);
      return cached.data;
    }
    throw error;
  }
}

export async function clearOfflineUser(userId: string, store: KeyValueStore = offlineStore): Promise<void> {
  revoked.set(userId, (revoked.get(userId) ?? 0) + 1);
  if (store === offlineStore) await outbox.wipe(userId);
  const prefix = namespace(userId);
  const keys = await store.keys();
  await Promise.all(keys.filter((key) => key.startsWith(prefix)).map((key) => store.delete(key)));
  clearOfflineStatus();
}
