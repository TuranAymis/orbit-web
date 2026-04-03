import type {
  Group,
  GroupDetail,
  GroupEventPreview,
  GroupGalleryItem,
  GroupMemberPreview,
  GroupStatSummary,
} from "@/entities/group/model/types";

interface GroupListResponseItem {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string;
  coverImageUrl?: string;
  memberCount?: number;
}

interface GroupDetailResponse extends GroupListResponseItem {
  id: string;
  name: string;
  isJoined?: boolean;
  category?: string;
  location?: string;
  founder?: string;
  stats?: Partial<GroupStatSummary>;
  upcomingEvents?: Array<Partial<GroupEventPreview>>;
  galleryPreview?: Array<Partial<GroupGalleryItem>>;
  memberPreview?: Array<Partial<GroupMemberPreview>>;
}

const fallbackGroupImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

export function mapGroupListResponse(response: GroupListResponseItem[]): Group[] {
  return response.map((group, index) => ({
    id: group.id ?? `group_${index}`,
    name: group.name ?? "Orbit Group",
    description: group.description ?? "No group description available yet.",
    memberCount: group.memberCount ?? 0,
    imageUrl: group.imageUrl ?? group.coverImageUrl ?? fallbackGroupImage,
  }));
}

export function mapGroupDetailResponse(
  response: GroupDetailResponse,
): GroupDetail {
  return {
    id: response.id,
    name: response.name,
    description: response.description ?? "No description available yet.",
    coverImageUrl: response.coverImageUrl ?? response.imageUrl ?? fallbackGroupImage,
    memberCount: response.memberCount ?? 0,
    isJoined: response.isJoined ?? false,
    category: response.category ?? "Community",
    location: response.location ?? "Global",
    founder: response.founder ?? "Orbit Team",
    stats: {
      weeklyPosts: response.stats?.weeklyPosts ?? 0,
      activeMembers: response.stats?.activeMembers ?? 0,
      upcomingEvents: response.stats?.upcomingEvents ?? 0,
    },
    upcomingEvents:
      response.upcomingEvents?.map((event, index) => ({
        id: event.id ?? `event_${index}`,
        title: event.title ?? "Untitled event",
        startsAt: event.startsAt ?? new Date().toISOString(),
        location: event.location ?? "Orbit Room",
      })) ?? [],
    galleryPreview:
      response.galleryPreview?.map((item, index) => ({
        id: item.id ?? `gallery_${index}`,
        imageUrl:
          item.imageUrl ??
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        alt: item.alt ?? "Community preview",
      })) ?? [],
    memberPreview:
      response.memberPreview?.map((member, index) => ({
        id: member.id ?? `member_${index}`,
        name: member.name ?? "Orbit Member",
        avatarFallback: member.avatarFallback ?? "OM",
        role: member.role ?? "Member",
      })) ?? [],
  };
}
