import { appConfig } from "@/config/appConfig";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function markNotificationRead(notificationId: string) {
  try {
    await httpClient.post(`/notifications/${encodeURIComponent(notificationId)}/read`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      if (appConfig.isDevelopment) {
        console.info("[orbit:notifications] Local backend has no mark-read endpoint yet.");
      }

      return;
    }

    throw error;
  }
}
