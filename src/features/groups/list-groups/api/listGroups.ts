import { mapGroupListResponse } from "@/entities/group/mappers";
import type { Group } from "@/entities/group/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendGroupResponse {
  id: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string;
  memberCount?: number;
}

export async function listGroups(): Promise<Group[]> {
  const payload = await httpClient.get<BackendGroupResponse[]>("/groups");

  return mapGroupListResponse(payload);
}
