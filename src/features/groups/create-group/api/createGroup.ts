import { HttpError, httpClient } from "@/shared/lib/http/httpClient";
import { mapCreatedGroupResponse } from "@/entities/group/mappers";

export interface CreateGroupInput {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  category?: string | null;
  location?: string | null;
}

interface BackendCreateGroupResponse {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  cover_image_url?: string | null;
  category?: string | null;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatedGroup {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createGroup(input: CreateGroupInput): Promise<CreatedGroup> {
  try {
    const payload = await httpClient.post<BackendCreateGroupResponse>("/groups", {
      name: input.name,
      description: input.description ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      category: input.category ?? null,
      location: input.location ?? null,
    });

    return mapCreatedGroupResponse(payload);
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) {
      throw new Error("Only admins can create groups");
    }

    throw error;
  }
}
