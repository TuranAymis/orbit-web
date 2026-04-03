import { orbitRuntimeConfig } from "@/config/env";

export async function leaveEvent(eventId: string) {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/events/${encodeURIComponent(eventId)}/leave`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to leave event.");
  }
}
