import { mapProfileResponse } from "@/entities/user/mappers";
import type { UserProfile } from "@/entities/user/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

export async function getProfile(): Promise<UserProfile> {
  const payload = await httpClient.get<unknown>("/users/me");

  return mapProfileResponse(payload);
}
