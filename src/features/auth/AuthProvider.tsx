import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { loginWithBackendSession } from "@/features/auth/auth-service";
import {
  AUTH_INVALID_EVENT,
  AUTH_SESSION_UPDATED_EVENT,
  isAuthenticatedSession,
  normalizeSession,
  readStoredSession,
  writeStoredSession,
} from "@/features/auth/auth-storage";
import type { AuthSession, LoginCredentials } from "@/features/auth/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthSession["user"] | null;
  role: AuthSession["user"]["role"] | null;
  authReady: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps extends PropsWithChildren {
  initialSession?: AuthSession | null;
}

export function AuthProvider({
  children,
  initialSession,
}: AuthProviderProps) {
  const restoredSession =
    initialSession === undefined
      ? readStoredSession()
      : normalizeSession(initialSession);
  const [session, setSession] = useState<AuthSession | null>(
    restoredSession,
  );
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthReady(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    function handleInvalidSession() {
      setSession(null);
      writeStoredSession(null);
    }

    function handleSessionUpdated(event: Event) {
      const nextSession = normalizeSession(
        (event as CustomEvent<AuthSession | null>).detail ?? null,
      );
      setSession(nextSession);
    }

    window.addEventListener(AUTH_INVALID_EVENT, handleInvalidSession);
    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);

    return () => {
      window.removeEventListener(AUTH_INVALID_EVENT, handleInvalidSession);
      window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, handleSessionUpdated);
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextSession = await loginWithBackendSession(credentials);
    setSession(nextSession);
    writeStoredSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    writeStoredSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      authReady,
      isLoading,
      isAuthenticated: isAuthenticatedSession(session),
      login,
      logout,
    }),
    [authReady, isLoading, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
