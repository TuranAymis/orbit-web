import { httpClient } from "@/shared/lib/http/httpClient";

export async function joinGroup(groupId: string) {
  await httpClient.post(`/groups/${encodeURIComponent(groupId)}/members`, {});
}
