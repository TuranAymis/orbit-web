import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Membership } from "@/entities/membership/model/types";
import { upgradeMembership } from "@/features/membership/upgrade-membership/api/upgradeMembership";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useUpgradeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeMembership,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: orbitQueryKeys.membership.current });

      const previousMembership = queryClient.getQueryData<Membership>(
        orbitQueryKeys.membership.current,
      );

      if (previousMembership) {
        queryClient.setQueryData<Membership>(orbitQueryKeys.membership.current, {
          ...previousMembership,
          tier: "premium",
          status: "active",
        });
      }

      return { previousMembership };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousMembership) {
        queryClient.setQueryData(
          orbitQueryKeys.membership.current,
          context.previousMembership,
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: orbitQueryKeys.membership.current,
      });
    },
  });
}
