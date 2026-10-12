import { useSyncExternalStore } from "react";

export interface OfflineStatus {
  isOffline: boolean;
  stale: boolean;
  savedAt: number | null;
}

const clearState: OfflineStatus = { isOffline: false, stale: false, savedAt: null };
let state = clearState;
const listeners = new Set<() => void>();

export function getOfflineStatus(): OfflineStatus { return state; }
export function subscribeOfflineStatus(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function setOfflineStale(savedAt: number) {
  state = { isOffline: true, stale: true, savedAt };
  listeners.forEach((listener) => listener());
}
export function clearOfflineStatus() {
  if (state === clearState) return;
  state = clearState;
  listeners.forEach((listener) => listener());
}
export function useOfflineStatus(): OfflineStatus {
  return useSyncExternalStore(subscribeOfflineStatus, getOfflineStatus, () => clearState);
}

if (typeof window !== "undefined") window.addEventListener("online", clearOfflineStatus);
