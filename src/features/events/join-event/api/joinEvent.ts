import { orbitRuntimeConfig } from "@/config/env";

export async function joinEvent(eventId: string) {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/events/${encodeURIComponent(eventId)}/join`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to join event.");
  }
}
