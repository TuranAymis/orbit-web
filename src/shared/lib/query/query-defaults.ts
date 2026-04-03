import type { DefaultOptions } from "@tanstack/react-query";

export const orbitQueryDefaults: DefaultOptions = {
  queries: {
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Surface failures quickly and let users retry intentionally from the UI.
    retry: 0,
  },
  mutations: {
    retry: 0,
    networkMode: "online",
  },
};
