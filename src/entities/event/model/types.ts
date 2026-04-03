export interface EventListItem {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  startsAt: string;
  endsAt: string;
  location: string;
  attendeeCount: number;
  isJoined: boolean;
  category: string;
}

export interface EventParticipantPreview {
  id: string;
  name: string;
  avatarFallback: string;
  role?: string;
}

export interface EventRelatedGroup {
  id: string;
  name: string;
  description: string;
}

export interface EventDetail extends EventListItem {
  host: string;
  participantsPreview: EventParticipantPreview[];
  relatedGroup: EventRelatedGroup | null;
}
