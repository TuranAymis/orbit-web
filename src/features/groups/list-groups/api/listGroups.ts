import { appConfig } from "@/config/appConfig";
import { mapGroupListResponse } from "@/entities/group/mappers";
import type { Group } from "@/entities/group/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";
import { getStoredUserId } from "@/features/auth/auth-storage";
import { readThrough } from "@/shared/lib/offline/offlineCache";

export async function listGroups(): Promise<Group[]> {
  return readThrough({ userId: getStoredUserId(), key: "groups:list", fetcher: fetchGroups });
}

async function fetchGroups(): Promise<Group[]> {
  const payload = await httpClient.get<unknown>("/groups");
  const mappedGroups = mapGroupListResponse(payload);

  if (appConfig.isDevelopment) {
    console.log("RAW GROUPS:", payload);
    console.log("MAPPED GROUPS:", mappedGroups);
  }

  return mappedGroups;
}
