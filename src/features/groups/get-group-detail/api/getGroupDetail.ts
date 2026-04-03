import { orbitRuntimeConfig } from "@/config/env";
import { mapGroupDetailResponse } from "@/entities/group/mappers";
import type { GroupDetail } from "@/entities/group/model/types";

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/groups/${encodeURIComponent(groupId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to load group detail.");
  }

  const payload = (await response.json()) as unknown;

  return mapGroupDetailResponse(payload as Parameters<typeof mapGroupDetailResponse>[0]);
}
