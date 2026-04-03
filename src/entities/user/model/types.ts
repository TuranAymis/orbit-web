export interface UserProfileStats {
  groupsJoined: number;
  eventsAttended: number;
  messagesSent: number;
}

export interface UserActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  location: string;
  joinedAt: string | null;
  membershipTier: string;
  stats: UserProfileStats;
  activityPreview: UserActivityItem[];
}

export type ProfileVisibility = "public" | "members" | "private";
export type ThemePreference = "system" | "dark" | "light";

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: ProfileVisibility;
  themePreference: ThemePreference;
  language: string;
}

export interface UpdateProfileInput {
  name: string;
  bio: string;
  location: string;
}

export interface UpdateSettingsInput extends UserSettings {}
