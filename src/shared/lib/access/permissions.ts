import type { AuthUser } from "@/features/auth/types";

export function canCreateGroup(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}

export function canDeleteGroup(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}

export function canCreateEvent(user: AuthUser | null | undefined) {
  return user?.role === "admin" || user?.role === "moderator";
}

export function canDeleteEvent(user: AuthUser | null | undefined) {
  return user?.role === "admin" || user?.role === "moderator";
}

export function canAssignModerators(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}
