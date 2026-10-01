import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NearbyEvents } from "@/features/discover/nearby/NearbyEvents";

afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
it("asks for location only after opt in and shows rounded distance", async () => {
  const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 41, longitude: 29 } }));
  vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: "e1", title: "Konser", distance_km: 3 }]), { headers: { "Content-Type": "application/json" } })));
  render(<MemoryRouter><NearbyEvents /></MemoryRouter>);
  expect(getCurrentPosition).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Konumumu kullan"));
  await waitFor(() => expect(screen.getByText(/Konser · 3 km/)).toBeTruthy());
  expect(localStorage.getItem("orbit_location_choice")).toBe("allowed");
});
it("offers manual city search after location denial", async () => {
  const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }));
  vi.stubGlobal("navigator", { ...navigator, geolocation: { getCurrentPosition } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ nearby_events: { items: [{ id: "e2", title: "Atölye", city: "İzmir" }] } }), { headers: { "Content-Type": "application/json" } })));
  render(<MemoryRouter><NearbyEvents /></MemoryRouter>);
  fireEvent.click(screen.getByText("Konumumu kullan"));
  expect(localStorage.getItem("orbit_location_choice")).toBe("denied");
  fireEvent.change(screen.getByLabelText("Şehir"), { target: { value: "İzmir" } });
  fireEvent.click(screen.getByText("Şehirdeki etkinlikleri göster"));
  await waitFor(() => expect(screen.getByText(/Atölye/)).toBeTruthy());
});
