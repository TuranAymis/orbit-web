import type {
  EventDetail,
  EventListItem,
  EventParticipantPreview,
  EventRelatedGroup,
} from "@/entities/event/model/types";

interface EventListResponseItem {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  attendeeCount?: number;
  isJoined?: boolean;
  category?: string;
}

interface EventDetailResponse extends EventListResponseItem {
  host?: string;
  relatedGroup?: Partial<EventRelatedGroup> | null;
  participantsPreview?: Array<Partial<EventParticipantPreview>>;
}

function mapEventBase(response: EventListResponseItem): EventListItem {
  return {
    id: response.id,
    title: response.title,
    description: response.description ?? "No event description available yet.",
    coverImageUrl:
      response.coverImageUrl ??
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    startsAt: response.startsAt ?? new Date().toISOString(),
    endsAt: response.endsAt ?? new Date().toISOString(),
    location: response.location ?? "Orbit Room",
    attendeeCount: response.attendeeCount ?? 0,
    isJoined: response.isJoined ?? false,
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
  return {
    ...mapEventBase(response),
    host: response.host ?? "Orbit Team",
    relatedGroup: response.relatedGroup
      ? {
          id: response.relatedGroup.id ?? "group_unknown",
          name: response.relatedGroup.name ?? "Orbit Group",
          description:
            response.relatedGroup.description ?? "Community context unavailable.",
        }
      : null,
    participantsPreview:
      response.participantsPreview?.map((participant, index) => ({
        id: participant.id ?? `participant_${index}`,
        name: participant.name ?? "Orbit Member",
        avatarFallback: participant.avatarFallback ?? "OM",
        role: participant.role ?? "Participant",
      })) ?? [],
  };
}
