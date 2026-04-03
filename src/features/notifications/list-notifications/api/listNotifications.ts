import { appConfig } from "@/config/appConfig";
import { mapNotificationsResponse } from "@/entities/notification/mappers";
import type { Notification } from "@/entities/notification/model/types";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function listNotifications(): Promise<Notification[]> {
  try {
    const payload = await httpClient.get<unknown>("/notifications");
    return mapNotificationsResponse(payload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      if (appConfig.isDevelopment) {
        console.info("[orbit:notifications] Local backend has no /notifications endpoint yet.");
      }

      return [];
    }

    throw error;
  }
}
