import { appConfig } from "@/config/appConfig";
import { mapGroupListResponse } from "@/entities/group/mappers";
import type { Group } from "@/entities/group/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendGroupResponse {
  id: string;
  name: string;
  description?: string | null;
  coverImageUrl?: string;
  cover_image_url?: string;
  image_url?: string;
  memberCount?: number;
  member_count?: number;
  isJoined?: boolean;
  is_joined?: boolean;
}

function normalizeListResponse(payload: unknown): BackendGroupResponse[] {
  if (Array.isArray(payload)) {
    return payload as BackendGroupResponse[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of ["items", "data", "groups"]) {
    const candidate = (payload as Record<string, unknown>)[key];

    if (Array.isArray(candidate)) {
      return candidate as BackendGroupResponse[];
    }
  }

  return [];
}

export async function listGroups(): Promise<Group[]> {
  const payload = await httpClient.get<unknown>("/groups");
  const groups = normalizeListResponse(payload);
  const mappedGroups = mapGroupListResponse(groups);

  if (appConfig.isDevelopment) {
    console.log("RAW GROUPS:", payload);
    console.log("MAPPED GROUPS:", mappedGroups);
  }

  return mappedGroups;
}
