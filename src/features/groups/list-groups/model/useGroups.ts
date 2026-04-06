import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/entities/group/model/types";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseGroupsResult {
  data: Group[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useGroups(): UseGroupsResult {
  const query = useQuery({
    queryKey: orbitQueryKeys.groups.all,
    queryFn: listGroups,
  });

  const data = query.data ?? [];
  const isLoading = query.isLoading;
  const error = query.error instanceof Error ? query.error : null;

  return {
    data,
    isLoading,
    error,
    isEmpty: !isLoading && !error && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
