import { appConfig } from "@/config/appConfig";
import {
  formatMembershipTierLabel,
  mapBackendMembershipLevelToTier,
} from "@/entities/membership/mappers";
import { httpClient, HttpError } from "@/shared/lib/http/httpClient";
import type { AuthSession, LoginCredentials } from "@/features/auth/types";

const DEMO_EMAIL = "demo@orbit.dev";
const DEMO_PASSWORD = "orbit123";

const mockSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: DEMO_EMAIL,
    membershipTier: "Core",
    avatarFallback: "DO",
  },
  accessToken: "test-access-token",
  tokenType: "bearer",
  expiresIn: 3600,
};

export class AuthError extends Error {}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function loginWithMockSession(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  await delay(400);

  if (
    credentials.email.trim().toLowerCase() === DEMO_EMAIL &&
    credentials.password === DEMO_PASSWORD
  ) {
    return mockSession;
  }

  throw new AuthError("Use demo@orbit.dev and orbit123 to sign in.");
}

interface BackendLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface BackendUserResponse {
  id: string;
  full_name: string;
  email: string;
  membership_level?: string;
}

function createAvatarFallback(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function mapBackendSession(
  tokenPayload: BackendLoginResponse,
  userPayload: BackendUserResponse,
): AuthSession {
  const mappedMembershipTier = formatMembershipTierLabel(
    mapBackendMembershipLevelToTier(userPayload.membership_level),
  );

  if (appConfig.isDevelopment) {
    console.info("[orbit:auth] backend membership level -> session tier", {
      rawMembershipLevel: userPayload.membership_level ?? null,
      mappedMembershipTier,
    });
  }

  return {
    isAuthenticated: true,
    accessToken: tokenPayload.access_token,
    tokenType: tokenPayload.token_type,
    expiresIn: tokenPayload.expires_in,
    user: {
      id: userPayload.id,
      name: userPayload.full_name,
      email: userPayload.email,
      membershipTier: mappedMembershipTier,
      avatarFallback: createAvatarFallback(userPayload.full_name),
    },
  };
}

function logAuthDebug(message: string, meta?: unknown) {
  if (!appConfig.isDevelopment) {
    return;
  }

  if (meta === undefined) {
    console.info(`[orbit:auth] ${message}`);
    return;
  }

  console.info(`[orbit:auth] ${message}`, meta);
}

export async function loginWithBackendSession(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  if (import.meta.env.MODE === "test") {
    return loginWithMockSession(credentials);
  }

  try {
    logAuthDebug("Attempting local backend login");

    const tokenPayload = await httpClient.post<BackendLoginResponse>("/auth/login", {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });

    const userPayload = await httpClient.get<BackendUserResponse>("/users/me", {
      token: tokenPayload.access_token,
    });

    return mapBackendSession(tokenPayload, userPayload);
  } catch (error) {
    if (error instanceof HttpError) {
      throw new AuthError(error.message);
    }

    throw new AuthError("Orbit could not reach the local backend.");
  }
}
