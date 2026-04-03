import { orbitRuntimeConfig } from "@/config/env";
import { mapNotificationsResponse } from "@/entities/notification/mappers";
import type { Notification } from "@/entities/notification/model/types";

export async function listNotifications(): Promise<Notification[]> {
  const response = await fetch(`${orbitRuntimeConfig.apiBaseUrl}/notifications`);

  if (!response.ok) {
    throw new Error("Failed to load notifications.");
  }

  const payload = (await response.json()) as unknown;

  return mapNotificationsResponse(payload);
}
