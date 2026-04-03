import { orbitRuntimeConfig } from "@/config/env";

export async function markNotificationRead(notificationId: string) {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read.");
  }
}
