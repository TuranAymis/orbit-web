import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export async function deleteGroup(groupId: string): Promise<void> {
  try {
    await httpClient.delete(`/groups/${groupId}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      throw new Error("Only admins can delete groups");
    }

    throw error;
  }
}
