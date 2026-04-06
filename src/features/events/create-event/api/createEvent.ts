import { HttpError, httpClient } from "@/shared/lib/http/httpClient";

export interface CreateEventInput {
  groupId: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  location: string;
  startsAt: string;
  endsAt: string;
}

export interface CreatedEvent {
  id: string;
  groupId: string;
  title: string;
}

interface BackendCreateEventResponse {
  id: string;
  group_id: string;
  title: string;
}

export async function createEvent(input: CreateEventInput): Promise<CreatedEvent> {
  try {
    const payload = await httpClient.post<BackendCreateEventResponse>("/events", {
      group_id: input.groupId,
      title: input.title,
      description: input.description ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      location: input.location,
      start_time: input.startsAt,
      end_time: input.endsAt,
    });

    return {
      id: payload.id,
      groupId: payload.group_id,
      title: payload.title,
    };
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      throw new Error("You don't have permission to create events in this group");
    }

    throw error;
  }
}
