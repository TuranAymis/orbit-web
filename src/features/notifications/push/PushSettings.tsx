import { useEffect, useState } from "react";
import { httpClient } from "@/shared/lib/http/httpClient";
import { Button } from "@/shared/ui/button";

type Category = "chat" | "event" | "group";
const labels: Record<Category, string> = { chat: "Sohbet", event: "Etkinlik", group: "Grup" };
function decodeKey(key: string): Uint8Array<ArrayBuffer> {
  const padded = key.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - key.length % 4) % 4);
  const bytes = Uint8Array.from(atob(padded), (value) => value.charCodeAt(0));
  return new Uint8Array(bytes);
}

export function PushSettings() {
  const [permission, setPermission] = useState(() => typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  const [preferences, setPreferences] = useState<Record<Category, boolean>>({ chat: true, event: true, group: true });
  const [message, setMessage] = useState("");
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && typeof Notification !== "undefined";
  useEffect(() => { void httpClient.get<Record<Category, boolean>>("/notifications/preferences").then(setPreferences).catch(() => setMessage("Tercihler yüklenemedi.")); }, []);
  const subscribe = async () => {
    if (!supported) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;
      const { public_key } = await httpClient.get<{ public_key: string | null }>("/notifications/push/config");
      if (!public_key) { setMessage("Bildirim hizmeti yapılandırılmamış."); return; }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: decodeKey(public_key) });
      await httpClient.post("/notifications/push/subscriptions", subscription.toJSON());
      setMessage("Bildirimler açıldı.");
    } catch { setMessage("Bildirimler açılamadı."); }
  };
  const toggle = async (category: Category) => {
    const enabled = !preferences[category];
    try {
      await httpClient.put(`/notifications/preferences/${category}`, { enabled });
      setPreferences((current) => ({ ...current, [category]: enabled }));
    } catch { setMessage("Tercih kaydedilemedi."); }
  };
  return <section className="space-y-3 rounded-2xl border border-white/10 p-5">
    <h2 className="text-xl font-semibold">Bildirim tercihleri</h2>
    {supported && permission === "default" && <Button onClick={() => void subscribe()}>Bildirimleri aç</Button>}
    {permission === "denied" && <p>Tarayıcı bildirim izni reddedildi.</p>}
    {!supported && <p>Bu tarayıcı push bildirimlerini desteklemiyor.</p>}
    {permission === "granted" && <p>Tarayıcı bildirim izni açık.</p>}
    {(Object.keys(labels) as Category[]).map((category) => <label key={category} className="flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={preferences[category]} onChange={() => void toggle(category)} />{labels[category]}
    </label>)}
    {message && <p role="status">{message}</p>}
  </section>;
}
