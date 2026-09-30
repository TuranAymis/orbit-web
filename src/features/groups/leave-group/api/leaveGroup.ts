import { httpClient } from "@/shared/lib/http/httpClient";

export async function leaveGroup(groupId: string) {
  await httpClient.delete(`/groups/${encodeURIComponent(groupId)}/members/me`);
}
