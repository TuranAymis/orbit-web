import type { AuthSession } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "orbit.auth.session";
export const AUTH_INVALID_EVENT = "orbit:auth:invalid";
export const AUTH_SESSION_UPDATED_EVENT = "orbit:auth:session-updated";

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

export function hasValidAccessToken(session: Pick<AuthSession, "accessToken"> | null | undefined) {
  return typeof session?.accessToken === "string" && session.accessToken.trim().length > 0;
}

export function isAuthenticatedSession(
  session: AuthSession | null | undefined,
): session is AuthSession {
  return Boolean(session?.isAuthenticated && hasValidAccessToken(session));
}

export function normalizeSession(session: AuthSession | null | undefined): AuthSession | null {
  return isAuthenticatedSession(session) ? session : null;
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
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_UPDATED_EVENT, { detail: session }));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_UPDATED_EVENT, { detail: null }));
}

export function getStoredAccessToken(): string | null {
  return readStoredSession()?.accessToken ?? null;
}

export function updateStoredSession(
  updater: (currentSession: AuthSession | null) => AuthSession | null,
) {
  const nextSession = normalizeSession(updater(readStoredSession()));
  writeStoredSession(nextSession);
  return nextSession;
}
