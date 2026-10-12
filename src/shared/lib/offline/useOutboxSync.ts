import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import { leaveGroup } from "@/features/groups/leave-group/api/leaveGroup";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";
import { leaveEvent } from "@/features/events/leave-event/api/leaveEvent";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";
import { outbox, type OutboxItem } from "@/shared/lib/offline/outbox";

function execute(item: OutboxItem) {
  switch (item.kind) {
    case "group.join": return joinGroup(item.targetId);
    case "group.leave": return leaveGroup(item.targetId);
    case "event.join": return joinEvent(item.targetId);
    case "event.leave": return leaveEvent(item.targetId);
  }
}

export function useOutboxSync() {
  const { authReady, user } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!authReady || !user) return;
    const userId = user.id;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = (item: OutboxItem) => {
      const family = item.kind.split(".")[0];
      if (family === "group") {
        void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.list });
        void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.detail(item.targetId) });
      } else {
        void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.events.list });
        void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.events.detail(item.targetId) });
      }
      void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed });
      void queryClient.invalidateQueries({ queryKey: orbitQueryKeys.chat.conversations });
    };
    const flush = async () => {
      if (disposed || (typeof navigator !== "undefined" && navigator.onLine === false)) return;
      clearTimeout(timer);
      try { await outbox.flush(userId, { execute, onSuccess: refresh, onDrop: refresh }); }
      catch { /* The HTTP client dispatches 401; session cleanup wipes this partition. */ }
      if (disposed) return;
      const pending = (await outbox.list(userId)).filter((item) => !item.failed);
      const next = pending[0]?.retryAt;
      if (next && next > Date.now()) timer = setTimeout(() => { void flush(); }, next - Date.now());
    };
    void outbox.load(userId).then(flush);
    const onOnline = () => { void flush(); };
    const onVisible = () => { if (document.visibilityState === "visible") void flush(); };
    const onMessage = (event: MessageEvent) => { if (event.data?.type === "FLUSH_OUTBOX") void flush(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.addEventListener?.("message", onMessage);
    return () => {
      disposed = true;
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker?.removeEventListener?.("message", onMessage);
    };
  }, [authReady, user?.id, queryClient]);
}
