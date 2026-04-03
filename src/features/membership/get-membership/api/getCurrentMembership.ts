import { mapMembershipResponse } from "@/entities/membership/mappers";
import type { Membership } from "@/entities/membership/model/types";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function getCurrentMembership(): Promise<Membership> {
  try {
    const payload = await httpClient.get<unknown>("/membership");
    return mapMembershipResponse(payload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      const userPayload = await httpClient.get<unknown>("/users/me");
      return mapMembershipResponse(userPayload);
    }

    throw error;
  }
}
