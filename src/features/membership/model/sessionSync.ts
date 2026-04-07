import { updateStoredSession } from "@/features/auth/auth-storage";

export function syncMembershipTierInSession(nextMembershipLabel: string) {
  return updateStoredSession((currentSession) => {
    if (!currentSession?.user) {
      return currentSession;
    }

    return {
      ...currentSession,
      user: {
        ...currentSession.user,
        membershipTier: nextMembershipLabel,
      },
    };
  });
}
