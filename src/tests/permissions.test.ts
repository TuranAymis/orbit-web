import { describe, expect, it } from "vitest";
import type { AuthUser } from "@/features/auth/types";
import {
  canAssignModerators,
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

  it("allows admins and moderators to create events", () => {
    expect(canCreateEvent(createUser("admin"))).toBe(true);
    expect(canCreateEvent(createUser("moderator"))).toBe(true);
    expect(canCreateEvent(createUser("user"))).toBe(false);
    expect(canCreateEvent(undefined)).toBe(false);
  });

  it("allows admins and moderators to delete events", () => {
    expect(canDeleteEvent(createUser("admin"))).toBe(true);
    expect(canDeleteEvent(createUser("moderator"))).toBe(true);
    expect(canDeleteEvent(createUser("user"))).toBe(false);
  });

  it("allows only admins to assign moderators", () => {
    expect(canAssignModerators(createUser("admin"))).toBe(true);
    expect(canAssignModerators(createUser("moderator"))).toBe(false);
    expect(canAssignModerators(createUser("user"))).toBe(false);
  });
});
