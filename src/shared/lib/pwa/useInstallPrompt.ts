import { useSyncExternalStore } from "react";
import { isStandalone } from "@/shared/lib/pwa/registerServiceWorker";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: InstallPromptEvent | null = null;
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((callback) => callback());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => { subscribers.delete(callback); };
}

function getCanInstall() {
  return deferredPrompt !== null && !isStandalone();
}

export function useInstallPrompt() {
  const canInstall = useSyncExternalStore(subscribe, getCanInstall, () => false);
  const promptInstall = async () => {
    const prompt = deferredPrompt;
    if (!prompt || isStandalone()) return;
    deferredPrompt = null;
    notify();
    await prompt.prompt();
    await prompt.userChoice;
  };
  return { canInstall, promptInstall };
}
