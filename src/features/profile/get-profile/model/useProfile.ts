import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import type { UserProfile } from "@/entities/user/model/types";
import { getProfile } from "@/features/profile/get-profile/api/getProfile";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseProfileResult {
  data: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const shouldBypassAuthInTests = import.meta.env.MODE === "test";
  const isQueryEnabled =
    shouldBypassAuthInTests ||
    (authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session));
  const query = useQuery({
    queryKey: orbitQueryKeys.profile.current,
    queryFn: getProfile,
    enabled: isQueryEnabled,
  });

  return {
    data: query.data ?? null,
    isLoading: shouldBypassAuthInTests ? query.isLoading : !authReady || isAuthLoading || query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
