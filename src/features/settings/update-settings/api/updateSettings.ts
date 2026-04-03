import { mapUpdateSettingsInput } from "@/entities/user/mappers";
import type { UpdateSettingsInput } from "@/entities/user/model/types";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function updateSettings(input: UpdateSettingsInput) {
  try {
    await httpClient.put("/settings", mapUpdateSettingsInput(input));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error("The local backend does not expose settings updates yet.");
    }

    throw error;
  }
}
