import { mapSettingsResponse } from "@/entities/user/mappers";
import type { UserSettings } from "@/entities/user/model/types";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function getSettings(): Promise<UserSettings> {
  try {
    const payload = await httpClient.get<unknown>("/settings");
    return mapSettingsResponse(payload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      const userPayload = await httpClient.get<unknown>("/users/me");
      return mapSettingsResponse(userPayload);
    }

    throw error;
  }
}
