import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: orbitQueryKeys.membership.current,
    queryFn: getCurrentMembership,
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
