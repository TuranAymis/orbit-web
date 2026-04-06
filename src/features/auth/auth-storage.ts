import type { AuthSession } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "orbit.auth.session";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidSession(value: unknown): value is AuthSession {
  if (!isRecord(value)) {
    return false;
  }

  const user = value.user;
  if (!isRecord(user)) {
    return false;
  }

  return (
    typeof value.isAuthenticated === "boolean" &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.membershipTier === "string" &&
    (user.role === "user" || user.role === "moderator" || user.role === "admin") &&
    typeof user.avatarFallback === "string" &&
    (value.isAuthenticated !== true || typeof value.accessToken === "string")
  );
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;
    if (!isValidSession(parsedValue)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return parsedValue;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeStoredSession(session: AuthSession | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    clearStoredSession();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAccessToken(): string | null {
  return readStoredSession()?.accessToken ?? null;
}
