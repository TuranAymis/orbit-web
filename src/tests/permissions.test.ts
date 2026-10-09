import { describe, expect, it } from "vitest";
import type { AuthUser } from "@/features/auth/types";
import {
  canAssignModerators,
  canAccessEventCreation,
  canCreateEvent,
  canCreateGroup,
  canDeleteEvent,
  canDeleteGroup,
} from "@/shared/lib/access/permissions";

function createUser(role: AuthUser["role"]): AuthUser {
  return {
    id: `user_${role}`,
    name: `${role} orbit`,
    email: `${role}@orbit.dev`,
    membershipTier: "Core",
    role,
    avatarFallback: role.slice(0, 2).toUpperCase(),
  };
}

describe("permission helpers", () => {
  it("allows only admins to create groups", () => {
    expect(canCreateGroup(createUser("admin"))).toBe(true);
    expect(canCreateGroup(createUser("moderator"))).toBe(false);
    expect(canCreateGroup(createUser("user"))).toBe(false);
    expect(canCreateGroup(null)).toBe(false);
  });

  it("allows only admins to delete groups", () => {
    expect(canDeleteGroup(createUser("admin"))).toBe(true);
    expect(canDeleteGroup(createUser("moderator"))).toBe(false);
    expect(canDeleteGroup(createUser("user"))).toBe(false);
  });

  it("allows admins and moderators to open event creation", () => {
    expect(canAccessEventCreation(createUser("admin"))).toBe(true);
    expect(canAccessEventCreation(createUser("moderator"))).toBe(true);
    expect(canAccessEventCreation(createUser("user"))).toBe(false);
    expect(canAccessEventCreation(undefined)).toBe(false);
  });

  it("uses backend scope flags for event actions", () => {
    expect(canCreateEvent({ canCreateEvents: true })).toBe(true);
    expect(canCreateEvent({ canCreateEvents: false })).toBe(false);
    expect(canDeleteEvent({ canManage: true })).toBe(true);
    expect(canDeleteEvent({ canManage: false })).toBe(false);
  });

  it("allows only admins to assign moderators", () => {
    expect(canAssignModerators(createUser("admin"))).toBe(true);
    expect(canAssignModerators(createUser("moderator"))).toBe(false);
    expect(canAssignModerators(createUser("user"))).toBe(false);
  });
});
