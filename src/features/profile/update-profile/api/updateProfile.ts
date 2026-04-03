import { mapUpdateProfileInput } from "@/entities/user/mappers";
import type { UpdateProfileInput } from "@/entities/user/model/types";
import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function updateProfile(input: UpdateProfileInput) {
  try {
    await httpClient.put("/profile", mapUpdateProfileInput(input));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error("The local backend does not expose profile updates yet.");
    }

    throw error;
  }
}
