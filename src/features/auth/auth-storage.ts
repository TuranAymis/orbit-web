import type { AuthSession } from "@/features/auth/types";

export const AUTH_STORAGE_KEY = "orbit.auth.session";

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as AuthSession;
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
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}
