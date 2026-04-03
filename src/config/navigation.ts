import type { LucideIcon } from "lucide-react";
import {
  Compass,
  Gem,
  MessageSquareText,
  Settings,
  Sparkles,
  UsersRound,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

export const navigationItems: NavigationItem[] = [
  {
    title: "Discover",
    description: "Browse communities and creators",
    to: "/discover",
    icon: Compass,
  },
  {
    title: "Groups",
    description: "Track the communities you follow",
    to: "/groups",
    icon: UsersRound,
  },
  {
    title: "Chat",
    description: "Stay connected in real time",
    to: "/chat",
    icon: MessageSquareText,
  },
  {
    title: "Events",
    description: "Find upcoming sessions and meetups",
    to: "/events",
    icon: Sparkles,
  },
  {
    title: "Settings",
    description: "Adjust your account preferences",
    to: "/settings",
    icon: Settings,
  },
  {
    title: "Membership",
    description: "Review plans, perks, and billing",
    to: "/membership",
    icon: Gem,
  },
];
