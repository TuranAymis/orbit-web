import { appConfig } from "@/config/appConfig";

type MutationPhase = "start" | "success" | "rollback";

export function logMutationLifecycle(
  mutationName: string,
  phase: MutationPhase,
  details?: Record<string, unknown>,
) {
  if (!appConfig.isDevelopment) {
    return;
  }

  console.info(`[orbit:mutation] ${mutationName} ${phase}`, details ?? {});
}
