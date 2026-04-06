export type OrbitUserRole = "user" | "moderator" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  membershipTier: string;
  role: OrbitUserRole;
  avatarFallback: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: AuthUser;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
