import {
  createContext,
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
  const [session, setSession] = useState<AuthSession | null>(() => {
    if (initialSession !== undefined) {
      return initialSession;
    }

    return readStoredSession();
  });

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
      isAuthenticated: Boolean(session?.isAuthenticated),
      login,
      logout,
    }),
    [login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
