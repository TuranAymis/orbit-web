import { orbitRuntimeConfig } from "@/config/env";
import { mapUnreadCountResponse } from "@/entities/notification/mappers";

export async function getUnreadCount(): Promise<number> {
  const response = await fetch(`${orbitRuntimeConfig.apiBaseUrl}/notifications/unread-count`);

  if (!response.ok) {
    throw new Error("Failed to load unread notifications.");
  }

  const payload = (await response.json()) as unknown;

  return mapUnreadCountResponse(payload);
}
