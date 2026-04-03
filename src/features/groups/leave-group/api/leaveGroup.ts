import { orbitRuntimeConfig } from "@/config/env";

export async function leaveGroup(groupId: string) {
  const response = await fetch(
    `${orbitRuntimeConfig.apiBaseUrl}/groups/${encodeURIComponent(groupId)}/leave`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to leave group.");
  }
}
