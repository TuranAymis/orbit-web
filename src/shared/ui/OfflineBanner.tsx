import { useOfflineStatus } from "@/shared/lib/offline/offlineStatus";
import { useEffect, useSyncExternalStore } from "react";
import { getStoredUserId } from "@/features/auth/auth-storage";
import { outbox } from "@/shared/lib/offline/outbox";
import { Button } from "@/shared/ui/button";

function savedTime(savedAt: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - savedAt) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function OfflineBanner({ userId = getStoredUserId() }: { userId?: string | null }) {
  const { stale, savedAt } = useOfflineStatus();
  const state = useSyncExternalStore(outbox.subscribe, () => userId ? outbox.state(userId) : outbox.state(""));
  useEffect(() => {
    if (!userId || (!state.synced && !state.savedOffline)) return;
    const timer = setTimeout(() => outbox.clearTransient(userId), 4000);
    return () => clearTimeout(timer);
  }, [userId, state.synced, state.savedOffline]);
  if ((!stale || savedAt === null) && !state.count && !state.notices.length && !state.synced && !state.savedOffline) return null;
  return (
    <div className="space-y-2">
      {(stale && savedAt !== null) || state.count || state.synced || state.savedOffline ? <div role="status" className="rounded-2xl border border-primary/30 bg-card px-4 py-3 text-sm text-foreground shadow-shell">
        {stale && savedAt !== null ? <p>You're offline — showing data saved {savedTime(savedAt)}.</p> : null}
        {state.count ? <p>{state.count} {state.count === 1 ? "change" : "changes"} waiting to sync</p> : null}
        {state.savedOffline ? <p>Saved offline — will sync when you're back online</p> : null}
        {state.synced ? <p>Synced</p> : null}
      </div> : null}
      {state.notices.length ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-card px-4 py-3 text-sm text-foreground shadow-shell">
        <p>Some changes could not sync:</p>
        <ul className="mt-2 space-y-2">{state.notices.map((notice) => <li key={notice.id} className="flex items-center justify-between gap-3">
          <span>{notice.kind} ({notice.targetId}): {notice.reason}</span>
          <Button size="sm" variant="ghost" onClick={() => { if (userId) void outbox.dismiss(userId, notice.id); }}>Dismiss</Button>
        </li>)}</ul>
      </div> : null}
    </div>
  );
}
