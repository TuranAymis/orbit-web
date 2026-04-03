import { QueryClient } from "@tanstack/react-query";

export function createOrbitQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 0,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
