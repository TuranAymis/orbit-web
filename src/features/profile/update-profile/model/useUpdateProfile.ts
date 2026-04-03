import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@/entities/user/model/types";
import type { UpdateProfileInput } from "@/entities/user/model/types";
import { updateProfile } from "@/features/profile/update-profile/api/updateProfile";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (input: UpdateProfileInput) => {
      await queryClient.cancelQueries({ queryKey: orbitQueryKeys.profile.current });

      const previousProfile = queryClient.getQueryData<UserProfile>(
        orbitQueryKeys.profile.current,
      );

      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(orbitQueryKeys.profile.current, {
          ...previousProfile,
          ...input,
        });
      }

      return { previousProfile };
    },
    onError: (_error, _input, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(orbitQueryKeys.profile.current, context.previousProfile);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: orbitQueryKeys.profile.current });
    },
  });
}
