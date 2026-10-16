import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import { getBadges } from "@/features/profile/badges/api/getBadges";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useBadges() {
  const { authReady, isAuthenticated, isLoading, session } = useAuth();
  const enabled =
    import.meta.env.MODE === "test" ||
    (authReady && !isLoading && isAuthenticated && hasValidAccessToken(session));

  return useQuery({ queryKey: orbitQueryKeys.profile.badges, queryFn: getBadges, enabled, staleTime: 0 });
}
