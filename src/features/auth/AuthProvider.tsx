import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { loginWithMockSession } from "@/features/auth/auth-service";
import { readStoredSession, writeStoredSession } from "@/features/auth/auth-storage";
import type { AuthSession, LoginCredentials } from "@/features/auth/types";

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthSession["user"] | null;
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
  const [session, setSession] = useState<AuthSession | null>(
    initialSession ?? null,
  );
  const [isLoading, setIsLoading] = useState(initialSession === undefined);

  useEffect(() => {
    if (initialSession !== undefined) {
      setSession(initialSession);
      setIsLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSession(readStoredSession());
      setIsLoading(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialSession]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const nextSession = await loginWithMockSession(credentials);
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
      isLoading,
      isAuthenticated: Boolean(session?.isAuthenticated),
      login,
      logout,
    }),
    [isLoading, login, logout, session],
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
