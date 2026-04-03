import { orbitRuntimeConfig } from "@/config/env";

export async function joinGroup(groupId: string) {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/groups/${encodeURIComponent(groupId)}/join`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to join group.");
  }
}
