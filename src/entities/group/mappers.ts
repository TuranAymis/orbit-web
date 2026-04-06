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
  imageUrl?: string | null;
  image_url?: string | null;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
  memberCount?: number;
  member_count?: number;
  isJoined?: boolean;
  is_joined?: boolean;
  joined?: boolean;
}

interface GroupDetailResponse extends GroupListResponseItem {
  id: string;
  name: string;
  isJoined?: boolean;
  is_joined?: boolean;
  joined?: boolean;
  category?: string;
  location?: string;
  founder?: string | { id?: string; name?: string };
  stats?: Partial<GroupStatSummary> & {
    posts?: number;
    events?: number;
    members?: number;
  };
  upcomingEvents?: Array<Partial<GroupEventPreview>>;
  upcoming_events?: Array<
    Partial<GroupEventPreview> & {
      startsAt?: string;
      starts_at?: string;
    }
  >;
  galleryPreview?: Array<Partial<GroupGalleryItem>>;
  gallery_preview?: Array<string | Partial<GroupGalleryItem>>;
  memberPreview?: Array<Partial<GroupMemberPreview>>;
  member_preview?: Array<
    Partial<GroupMemberPreview> & {
      avatar_url?: string | null;
    }
  >;
}

const fallbackGroupImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

export function mapGroupListResponse(response: GroupListResponseItem[]): Group[] {
  return response.map((group, index) => ({
    id: group.id ?? `group_${index}`,
    name: group.name ?? "Orbit Group",
    description: group.description ?? "No group description available yet.",
    memberCount: group.memberCount ?? group.member_count ?? 0,
    imageUrl:
      group.image_url ??
      group.imageUrl ??
      group.cover_image_url ??
      group.coverImageUrl ??
      fallbackGroupImage,
    isJoined: group.isJoined ?? group.is_joined ?? group.joined ?? false,
  }));
}

export function mapGroupDetailResponse(
  response: GroupDetailResponse,
): GroupDetail {
  const founderName =
    typeof response.founder === "string"
      ? response.founder
      : response.founder?.name ?? "Orbit Team";

  const stats = response.stats ?? {};
  const rawUpcomingEvents = response.upcomingEvents ?? response.upcoming_events ?? [];
  const rawGalleryPreview = response.galleryPreview ?? response.gallery_preview ?? [];
  const rawMemberPreview = response.memberPreview ?? response.member_preview ?? [];

  return {
    id: response.id,
    name: response.name,
    description: response.description ?? "No description available yet.",
    coverImageUrl:
      response.image_url ??
      response.imageUrl ??
      response.cover_image_url ??
      response.coverImageUrl ??
      fallbackGroupImage,
    memberCount: response.memberCount ?? response.member_count ?? 0,
    isJoined: response.isJoined ?? response.is_joined ?? response.joined ?? false,
    category: response.category ?? "Community",
    location: response.location ?? "Global",
    founder: founderName,
    stats: {
      weeklyPosts: stats.weeklyPosts ?? stats.posts ?? 0,
      activeMembers: stats.activeMembers ?? stats.members ?? 0,
      upcomingEvents: stats.upcomingEvents ?? stats.events ?? 0,
    },
    upcomingEvents: rawUpcomingEvents.map((event, index) => {
      const startsAt =
        event.startsAt ??
        (event as { starts_at?: string }).starts_at ??
        new Date().toISOString();

      return {
        id: event.id ?? `event_${index}`,
        title: event.title ?? "Untitled event",
        startsAt,
        location: event.location ?? "Orbit Room",
      };
    }),
    galleryPreview: rawGalleryPreview.map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `gallery_${index}`,
          imageUrl: item,
          alt: "Community preview",
        };
      }

      return {
        id: item.id ?? `gallery_${index}`,
        imageUrl:
          item.imageUrl ??
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        alt: item.alt ?? "Community preview",
      };
    }),
    memberPreview: rawMemberPreview.map((member, index) => ({
        id: member.id ?? `member_${index}`,
        name: member.name ?? "Orbit Member",
        avatarFallback:
          member.avatarFallback ??
          member.name
            ?.split(" ")
            .map((part) => part[0] ?? "")
            .join("")
            .slice(0, 2)
            .toUpperCase() ??
          "OM",
        role: member.role ?? "Member",
      })),
  };
}
