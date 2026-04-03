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
