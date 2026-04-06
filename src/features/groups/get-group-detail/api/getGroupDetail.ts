import { mapGroupDetailResponse } from "@/entities/group/mappers";
import type { GroupDetail } from "@/entities/group/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendGroupResponse {
  id: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  member_count?: number;
  is_joined?: boolean;
  category?: string | null;
  location?: string | null;
  founder?: {
    id?: string;
    name?: string;
  };
  stats?: {
    posts?: number;
    events?: number;
    members?: number;
  };
  upcoming_events?: Array<{
    id?: string;
    title?: string;
    starts_at?: string;
    location?: string;
  }>;
  gallery_preview?: string[];
  member_preview?: Array<{
    id?: string;
    name?: string;
    avatar_url?: string | null;
  }>;
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  const payload = await httpClient.get<BackendGroupResponse>(
    `/groups/${encodeURIComponent(groupId)}`,
  );

  return mapGroupDetailResponse({
    ...payload,
    category: payload.category ?? undefined,
    location: payload.location ?? undefined,
  });
}
