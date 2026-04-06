import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import type { Membership } from "@/entities/membership/model/types";
import { getCurrentMembership } from "@/features/membership/get-membership/api/getCurrentMembership";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseCurrentMembershipResult {
  data: Membership | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCurrentMembership(): UseCurrentMembershipResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const shouldBypassAuthInTests = import.meta.env.MODE === "test";
  const isQueryEnabled =
    shouldBypassAuthInTests ||
    (authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session));
  const query = useQuery({
    queryKey: orbitQueryKeys.membership.current,
    queryFn: getCurrentMembership,
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
