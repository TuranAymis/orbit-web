import type { PropsWithChildren } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import type { AuthSession } from "@/features/auth/types";

interface AppProvidersProps extends PropsWithChildren {
  initialSession?: AuthSession | null;
}

export function AppProviders({ children, initialSession }: AppProvidersProps) {
  return <AuthProvider initialSession={initialSession}>{children}</AuthProvider>;
}
