import { useEffect, useState } from "react";
import { applyUpdate, hasUpdateAvailable, onUpdateAvailable } from "@/shared/lib/pwa/registerServiceWorker";
import { Button } from "@/shared/ui/button";

export function UpdateBanner() {
  const [available, setAvailable] = useState(hasUpdateAvailable);
  useEffect(() => onUpdateAvailable(() => setAvailable(true)), []);
  if (!available) return null;
  return (
    <div role="status" className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-primary/30 bg-card px-4 py-3 text-sm text-foreground shadow-shell">
      <span>A new version is available</span>
      <Button size="sm" onClick={applyUpdate}>Reload</Button>
    </div>
  );
}
