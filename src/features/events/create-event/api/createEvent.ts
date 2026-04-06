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

interface BackendValidationIssue {
  loc?: Array<string | number>;
  msg?: string;
  type?: string;
}

function getCreateEventValidationMessage(error: HttpError) {
  const payload = error.payload as { detail?: BackendValidationIssue[] } | undefined;
  const details = Array.isArray(payload?.detail) ? payload.detail : [];
  const coverImageIssue = details.find((issue) =>
    issue.loc?.some((part) => String(part) === "cover_image_url"),
  );

  if (!coverImageIssue) {
    return "Some fields are invalid. Please check your input.";
  }

  if (coverImageIssue.type === "string_too_long") {
    return "Image URL is too long. Please use a normal image link.";
  }

  return "Please enter a valid image URL. Base64 images are not supported.";
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

    if (error instanceof HttpError && error.status === 422) {
      throw new Error(getCreateEventValidationMessage(error));
    }

    throw error;
  }
}
