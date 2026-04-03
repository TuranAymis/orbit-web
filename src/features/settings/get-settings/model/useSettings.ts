import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: orbitQueryKeys.settings.current,
    queryFn: getSettings,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
