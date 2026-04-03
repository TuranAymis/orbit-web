export interface AuthUser {
  id: string;
  name: string;
  email: string;
  membershipTier: string;
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
