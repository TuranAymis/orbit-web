import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Membership } from "@/entities/membership/model/types";
import { syncMembershipTierInSession } from "@/features/membership/model/sessionSync";
import { upgradeMembership } from "@/features/membership/upgrade-membership/api/upgradeMembership";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useUpgradeMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeMembership,
    onMutate: async () => {
      logMutationLifecycle("membership.upgrade", "start");
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

      const previousSession = syncMembershipTierInSession("Premium");

      return { previousMembership, previousSession };
    },
    onSuccess: () => {
      logMutationLifecycle("membership.upgrade", "success");
    },
    onError: (_error, _variables, context) => {
      logMutationLifecycle("membership.upgrade", "rollback");
      if (context?.previousMembership) {
        queryClient.setQueryData(
          orbitQueryKeys.membership.current,
          context.previousMembership,
        );
      }

      if (context?.previousSession?.user) {
        syncMembershipTierInSession(context.previousSession.user.membershipTier);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: orbitQueryKeys.membership.current,
      });
    },
  });
}
