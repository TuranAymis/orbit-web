import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import type { UserSettings } from "@/entities/user/model/types";
import { getSettings } from "@/features/settings/get-settings/api/getSettings";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseSettingsResult {
  data: UserSettings | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const shouldBypassAuthInTests = import.meta.env.MODE === "test";
  const isQueryEnabled =
    shouldBypassAuthInTests ||
    (authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session));
  const query = useQuery({
    queryKey: orbitQueryKeys.settings.current,
    queryFn: getSettings,
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
