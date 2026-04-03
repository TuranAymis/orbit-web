import { QueryClient } from "@tanstack/react-query";
import { orbitQueryDefaults } from "@/shared/lib/query/query-defaults";

export function createOrbitQueryClient() {
  return new QueryClient({
    defaultOptions: orbitQueryDefaults,
  });
}
