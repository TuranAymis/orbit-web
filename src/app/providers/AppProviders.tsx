import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import type { AuthSession } from "@/features/auth/types";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";

interface AppProvidersProps extends PropsWithChildren {
  initialSession?: AuthSession | null;
  queryClient?: QueryClient;
}

export function AppProviders({
  children,
  initialSession,
  queryClient: providedQueryClient,
}: AppProvidersProps) {
  const [queryClient] = useState(() => providedQueryClient ?? createOrbitQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
