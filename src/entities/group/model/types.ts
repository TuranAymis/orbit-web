export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  imageUrl: string;
}

export interface GroupStatSummary {
  weeklyPosts: number;
  activeMembers: number;
  upcomingEvents: number;
}

export interface GroupEventPreview {
  id: string;
  title: string;
  startsAt: string;
  location: string;
}

export interface GroupGalleryItem {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface GroupMemberPreview {
  id: string;
  name: string;
  avatarFallback: string;
  role?: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  memberCount: number;
  isJoined: boolean;
  category: string;
  location: string;
  founder: string;
  stats: GroupStatSummary;
  upcomingEvents: GroupEventPreview[];
  galleryPreview: GroupGalleryItem[];
  memberPreview: GroupMemberPreview[];
}
