type UpdateCallback = () => void;

const subscribers = new Set<UpdateCallback>();
let waitingWorker: ServiceWorker | null = null;
let updateAvailable = false;
let registrationPromise: Promise<ServiceWorkerRegistration | undefined> | undefined;
let reloadOnControllerChange = false;

function announceWaiting(worker: ServiceWorker | null) {
  if (!worker || !navigator.serviceWorker.controller) return;
  waitingWorker = worker;
  updateAvailable = true;
  subscribers.forEach((callback) => callback());
}

export function onUpdateAvailable(callback: UpdateCallback): () => void {
  subscribers.add(callback);
  if (updateAvailable) callback();
  return () => subscribers.delete(callback);
}

export function hasUpdateAvailable(): boolean {
  return updateAvailable;
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(undefined);
  }
  if (registrationPromise) return registrationPromise;
  registrationPromise = navigator.serviceWorker.register("/sw.js").then((registration) => {
    announceWaiting(registration.waiting);
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      installing?.addEventListener("statechange", () => {
        if (installing.state === "installed") announceWaiting(registration.waiting ?? installing);
      });
    });
    return registration;
  }).catch(() => undefined);
  return registrationPromise;
}

export function applyUpdate(): void {
  if (!waitingWorker || !("serviceWorker" in navigator)) return;
  if (!reloadOnControllerChange) {
    reloadOnControllerChange = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
  }
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}

export function isStandalone(): boolean {
  return typeof window !== "undefined" && (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
