import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateSettingsInput, UserSettings } from "@/entities/user/model/types";
import { updateSettings } from "@/features/settings/update-settings/api/updateSettings";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onMutate: async (input: UpdateSettingsInput) => {
      await queryClient.cancelQueries({ queryKey: orbitQueryKeys.settings.current });

      const previousSettings = queryClient.getQueryData<UserSettings>(
        orbitQueryKeys.settings.current,
      );

      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(orbitQueryKeys.settings.current, input);
      }

      return { previousSettings };
    },
    onError: (_error, _input, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(orbitQueryKeys.settings.current, context.previousSettings);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: orbitQueryKeys.settings.current });
    },
  });
}
