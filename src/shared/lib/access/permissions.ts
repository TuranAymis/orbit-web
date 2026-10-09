import type { AuthUser } from "@/features/auth/types";

export function canCreateGroup(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}

export function canDeleteGroup(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}

export function canAccessEventCreation(user: AuthUser | null | undefined) {
  return user?.role === "admin" || user?.role === "moderator";
}

export function canCreateEvent(group: { canCreateEvents: boolean }) {
  return group.canCreateEvents;
}

export function canDeleteEvent(event: { canManage: boolean }) {
  return event.canManage;
}

export function canAssignModerators(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}
