import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/entities/group/model/types";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseGroupsResult {
  data: Group[];
  isLoading: boolean;
  isEmpty: boolean;
}

export function useGroups(): UseGroupsResult {
  const query = useQuery({
    queryKey: orbitQueryKeys.groups.all,
    queryFn: listGroups,
  });

  const data = query.data ?? [];
  const isLoading = query.isLoading;

  return {
    data,
    isLoading,
    isEmpty: !isLoading && data.length === 0,
  };
}
