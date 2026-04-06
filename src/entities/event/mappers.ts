import type {
  EventDetail,
  EventListItem,
  EventParticipantPreview,
  EventRelatedGroup,
} from "@/entities/event/model/types";

interface EventListResponseItem {
  id: string;
  groupId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  image_url?: string | null;
  coverImageUrl?: string;
  cover_image_url?: string | null;
  startsAt?: string;
  endsAt?: string;
  starts_at?: string;
  ends_at?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  attendeeCount?: number;
  attendee_count?: number;
  isJoined?: boolean;
  is_joined?: boolean;
  category?: string;
  group_id?: string;
}

interface EventDetailResponse extends EventListResponseItem {
  host?: string;
  relatedGroup?: Partial<EventRelatedGroup> | null;
  related_group?: Partial<EventRelatedGroup> | null;
  participantsPreview?: Array<Partial<EventParticipantPreview>>;
  participants_preview?: Array<
    Partial<EventParticipantPreview> & {
      avatar_url?: string | null;
    }
  >;
}

type EventParticipantResponseShape =
  | Partial<EventParticipantPreview>
  | (Partial<EventParticipantPreview> & {
      avatar_url?: string | null;
    });

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mapEventBase(response: EventListResponseItem): EventListItem {
  return {
    id: response.id,
    groupId: response.group_id ?? response.groupId,
    title: response.title,
    description: response.description ?? "No event description available yet.",
    coverImageUrl:
      response.image_url ??
      response.imageUrl ??
      response.cover_image_url ??
      response.coverImageUrl ??
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    startsAt:
      response.starts_at ??
      response.startsAt ??
      response.start_time ??
      new Date().toISOString(),
    endsAt:
      response.ends_at ??
      response.endsAt ??
      response.end_time ??
      new Date().toISOString(),
    location: response.location ?? "Orbit Room",
    attendeeCount: response.attendeeCount ?? response.attendee_count ?? 0,
    isJoined: response.isJoined ?? response.is_joined ?? false,
    category: response.category ?? "Event",
  };
}

export function mapEventListResponse(
  response: EventListResponseItem[],
): EventListItem[] {
  return response.map(mapEventBase);
}

export function mapEventDetailResponse(
  response: EventDetailResponse,
): EventDetail {
  const participants = (response.participantsPreview ??
    response.participants_preview) as EventParticipantResponseShape[] | undefined;

  return {
    ...mapEventBase(response),
    host: response.host ?? "Orbit Team",
    relatedGroup: response.relatedGroup ?? response.related_group
      ? {
          id:
            (response.relatedGroup ?? response.related_group)?.id ??
            "group_unknown",
          name:
            (response.relatedGroup ?? response.related_group)?.name ??
            "Orbit Group",
          description:
            (response.relatedGroup ?? response.related_group)?.description ??
            "Community context unavailable.",
        }
      : response.group_id
        ? {
            id: response.group_id,
            name: "Orbit Group",
            description: "Community context unavailable.",
          }
        : null,
    participantsPreview:
      participants?.map((participant, index) => {
        const safeParticipant = isObject(participant) ? participant : {};
        const avatarUrl =
          "avatar_url" in safeParticipant
            ? (safeParticipant.avatar_url as string | null | undefined)
            : undefined;

        return {
          id:
            typeof safeParticipant.id === "string"
              ? safeParticipant.id
              : `participant_${index}`,
          name:
            typeof safeParticipant.name === "string"
              ? safeParticipant.name
              : "Orbit Member",
          avatarFallback:
            (typeof safeParticipant.avatarFallback === "string"
              ? safeParticipant.avatarFallback
              : undefined) ??
            (typeof safeParticipant.name === "string"
              ? safeParticipant.name
              : undefined)
              ?.split(" ")
              .map((part) => part[0] ?? "")
              .join("")
              .slice(0, 2)
              .toUpperCase() ??
            avatarUrl?.slice(0, 2).toUpperCase() ??
            "OM",
          role:
            typeof safeParticipant.role === "string"
              ? safeParticipant.role
              : "Participant",
        };
      }) ?? [],
  };
}
