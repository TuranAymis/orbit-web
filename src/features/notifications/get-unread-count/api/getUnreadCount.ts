import { appConfig } from "@/config/appConfig";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";
import { mapUnreadCountResponse } from "@/entities/notification/mappers";

export async function getUnreadCount(): Promise<number> {
  try {
    const payload = await httpClient.get<unknown>("/notifications/unread-count");
    return mapUnreadCountResponse(payload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      if (appConfig.isDevelopment) {
        console.info("[orbit:notifications] Local backend has no unread count endpoint yet.");
      }

      return 0;
    }

    throw error;
  }
}
