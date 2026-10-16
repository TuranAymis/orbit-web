import { httpClient } from "@/shared/lib/http/httpClient";

interface BadgePayload {
  key: string;
  title: string;
  description: string;
  earned: boolean;
  awarded_at: string | null;
}

export interface ProfileBadge {
  key: string;
  title: string;
  description: string;
  earned: boolean;
  awardedAt: string | null;
}

export function mapBadgeResponse(badge: BadgePayload): ProfileBadge {
  return {
    key: badge.key,
    title: badge.title,
    description: badge.description,
    earned: badge.earned,
    awardedAt: badge.awarded_at,
  };
}

export async function getBadges(): Promise<ProfileBadge[]> {
  const payload = await httpClient.get<BadgePayload[]>("/users/me/badges");
  return payload.map(mapBadgeResponse);
}
