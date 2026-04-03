import type {
  ProfileVisibility,
  ThemePreference,
  UpdateProfileInput,
  UpdateSettingsInput,
  UserActivityItem,
  UserProfile,
  UserProfileStats,
  UserSettings,
} from "@/entities/user/model/types";
import {
  formatMembershipTierLabel,
  mapBackendMembershipLevelToTier,
} from "@/entities/membership/mappers";

interface ProfileResponse {
  id?: string;
  name?: string;
  full_name?: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string;
  location?: string;
  joinedAt?: string | null;
  created_at?: string | null;
  membershipTier?: string;
  membership_level?: string;
  stats?: Partial<UserProfileStats>;
  activityPreview?: Array<Partial<UserActivityItem>>;
}

interface SettingsResponse {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  profileVisibility?: string;
  themePreference?: string;
  language?: string;
}

function mapProfileVisibility(value?: string): ProfileVisibility {
  switch (value) {
    case "members":
    case "private":
      return value;
    default:
      return "public";
  }
}

function mapThemePreference(value?: string): ThemePreference {
  switch (value) {
    case "dark":
    case "light":
      return value;
    default:
      return "system";
  }
}

export function mapProfileResponse(payload: unknown): UserProfile {
  const response = (payload ?? {}) as ProfileResponse;
  const membershipTier = formatMembershipTierLabel(
    mapBackendMembershipLevelToTier(response.membershipTier ?? response.membership_level),
  );

  return {
    id: response.id ?? "user_unknown",
    name: response.name ?? response.full_name ?? "Orbit Member",
    email: response.email ?? "member@orbit.dev",
    avatarUrl: response.avatarUrl ?? null,
    bio: response.bio ?? "No bio has been added yet.",
    location: response.location ?? "Remote",
    joinedAt: response.joinedAt ?? response.created_at ?? null,
    membershipTier,
    stats: {
      groupsJoined: response.stats?.groupsJoined ?? 0,
      eventsAttended: response.stats?.eventsAttended ?? 0,
      messagesSent: response.stats?.messagesSent ?? 0,
    },
    activityPreview:
      response.activityPreview?.map((activity, index) => ({
        id: activity.id ?? `activity_${index}`,
        title: activity.title ?? "Orbit activity",
        description: activity.description ?? "Recent activity will appear here.",
        createdAt: activity.createdAt ?? new Date().toISOString(),
      })) ?? [],
  };
}

export function mapSettingsResponse(payload: unknown): UserSettings {
  const response = (payload ?? {}) as SettingsResponse;

  return {
    emailNotifications: response.emailNotifications ?? true,
    pushNotifications: response.pushNotifications ?? true,
    marketingEmails: response.marketingEmails ?? false,
    profileVisibility: mapProfileVisibility(response.profileVisibility),
    themePreference: mapThemePreference(response.themePreference),
    language: response.language ?? "en",
  };
}

export function mapUpdateProfileInput(input: UpdateProfileInput): UpdateProfileInput {
  return {
    name: input.name.trim(),
    bio: input.bio.trim(),
    location: input.location.trim(),
  };
}

export function mapUpdateSettingsInput(input: UpdateSettingsInput): UpdateSettingsInput {
  return {
    ...input,
  };
}
