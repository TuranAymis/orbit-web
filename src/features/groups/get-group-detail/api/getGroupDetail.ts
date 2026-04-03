import { mapGroupDetailResponse } from "@/entities/group/mappers";
import type { GroupDetail } from "@/entities/group/model/types";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendGroupResponse {
  id: string;
  name: string;
  description?: string | null;
  owner_id?: string;
}

interface BackendMembershipResponse {
  user_id: string;
  role?: string;
}

interface BackendEventResponse {
  id: string;
  title: string;
  location?: string;
  start_time?: string;
}

interface BackendUserResponse {
  id: string;
}

function createFallbackAvatar(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function getGroupDetail(groupId: string): Promise<GroupDetail> {
  const [groupPayload, membersPayload, eventsPayload, currentUser] = await Promise.all([
    httpClient.get<BackendGroupResponse>(`/groups/${encodeURIComponent(groupId)}`),
    httpClient.get<BackendMembershipResponse[]>(
      `/groups/${encodeURIComponent(groupId)}/members`,
    ),
    httpClient.get<BackendEventResponse[]>(`/events?group_id=${encodeURIComponent(groupId)}`),
    httpClient.get<BackendUserResponse>("/users/me"),
  ]);

  const memberCount = membersPayload.length;
  const isJoined =
    groupPayload.owner_id === currentUser.id ||
    membersPayload.some((member) => member.user_id === currentUser.id);

  return mapGroupDetailResponse({
    id: groupPayload.id,
    name: groupPayload.name,
    description: groupPayload.description ?? undefined,
    memberCount,
    isJoined,
    category: "Community",
    location: "Orbit",
    founder: "Group owner",
    stats: {
      weeklyPosts: 0,
      activeMembers: memberCount,
      upcomingEvents: eventsPayload.length,
    },
    upcomingEvents: eventsPayload.slice(0, 3).map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.start_time ?? new Date().toISOString(),
      location: event.location ?? "Orbit Room",
    })),
    galleryPreview: [],
    memberPreview: membersPayload.slice(0, 6).map((member, index) => {
      const role = member.role ?? "member";
      const label = `${role} ${index + 1}`;

      return {
        id: member.user_id,
        name: label,
        avatarFallback: createFallbackAvatar(label),
        role,
      };
    }),
  });
}
