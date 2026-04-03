import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function upgradeMembership() {
  try {
    await httpClient.post("/membership/upgrade");
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw new Error("The local backend does not expose membership upgrades yet.");
    }

    throw error;
  }
}
