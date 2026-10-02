import { useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "@/shared/lib/http/httpClient";
import { Button } from "@/shared/ui/button";

type NearbyEvent = { id: string; title: string; city?: string | null; distance_km?: number };
const STORAGE_KEY = "orbit_location_choice";

export function NearbyEvents() {
  const [choice, setChoice] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "unknown");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const searchCity = async () => {
    if (!city.trim()) return;
    setState("loading");
    try {
      const params = new URLSearchParams({ city: city.trim() });
      if (category) params.set("category", category);
      const result = await httpClient.get<{ nearby_events: { items: Array<{ id: string; title: string; city?: string | null }> } }>(`/discover?${params}`);
      setEvents(result.nearby_events.items);
      setState("ready");
    } catch { setState("error"); }
  };
  const requestLocation = () => {
    if (!supported) { setChoice("unsupported"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      localStorage.setItem(STORAGE_KEY, "allowed");
      setChoice("allowed");
      try {
        const params = new URLSearchParams({ lat: String(coords.latitude), lon: String(coords.longitude), radius_km: "25" });
        if (category) params.set("category", category);
        setEvents(await httpClient.get<NearbyEvent[]>(`/discover/nearby?${params}`));
        setState("ready");
      } catch { setState("error"); }
    }, () => {
      localStorage.setItem(STORAGE_KEY, "denied");
      setChoice("denied");
      setState("idle");
    });
  };
  return <section className="space-y-3 rounded-2xl border border-white/10 p-5" aria-label="Yakındaki etkinlikler">
    <h2 className="text-xl font-semibold">Yakındaki etkinlikler</h2>
    <label className="block text-sm">Kategori
      <input aria-label="Kategori" value={category} onChange={(event) => setCategory(event.target.value)} className="ml-2 min-h-10 rounded bg-black/30 p-2" />
    </label>
    {supported && <Button onClick={requestLocation}>Konumumu kullan</Button>}
    {state === "loading" && <p>Yakındaki etkinlikler yükleniyor…</p>}
    {state === "error" && <p>Yakındaki etkinlikler yüklenemedi.</p>}
    {state === "ready" && events.length === 0 && <p>Yakında etkinlik bulunamadı.</p>}
    {events.map((event) => <Link key={event.id} to={`/events/${event.id}`} className="block rounded border border-white/10 p-3">
      {event.title} {event.distance_km !== undefined ? `· ${event.distance_km} km` : ""} {event.city ?? ""}
    </Link>)}
    {(!supported || choice === "denied" || choice === "unsupported") && <div>
      <p>Konum kullanılamıyor. Şehir seçerek keşfetmeye devam edin.</p>
      <input aria-label="Şehir" value={city} onChange={(event) => setCity(event.target.value)} className="rounded bg-black/30 p-2" />
      <Button onClick={() => void searchCity()}>Şehirdeki etkinlikleri göster</Button>
    </div>}
  </section>;
}
