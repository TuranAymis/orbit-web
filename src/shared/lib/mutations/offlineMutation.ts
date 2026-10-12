import { outbox, isNetworkFailure, type OutboxKind } from "@/shared/lib/offline/outbox";

function registerSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.ready.then((registration) => {
    const sync = (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
    return sync?.register("orbit-outbox");
  }).catch(() => undefined);
}

export async function executeOrQueue(userId: string | null | undefined, kind: OutboxKind, targetId: string, execute: () => Promise<unknown>): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    if (!userId) throw new Error("Sign in to save changes offline.");
    await outbox.enqueue(userId, kind, targetId);
    registerSync();
    return true;
  }
  try {
    await execute();
    return false;
  } catch (error) {
    if (!isNetworkFailure(error) || !userId) throw error;
    await outbox.enqueue(userId, kind, targetId);
    registerSync();
    return true;
  }
}
