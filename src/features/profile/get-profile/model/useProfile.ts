import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: orbitQueryKeys.profile.current,
    queryFn: getProfile,
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
