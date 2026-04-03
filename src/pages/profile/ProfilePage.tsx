import { ProfileHeroCard } from "@/entities/user/ui/ProfileHeroCard";
import { UserMetaCard } from "@/entities/user/ui/UserMetaCard";
import { useProfile } from "@/features/profile/get-profile/model/useProfile";
import { useUpdateProfile } from "@/features/profile/update-profile/model/useUpdateProfile";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageContainer } from "@/shared/ui/page-container";
import { ProfileActivityPreview } from "@/widgets/profile/ProfileActivityPreview";
import { ProfileOverview } from "@/widgets/profile/ProfileOverview";
import { ProfileStatsPanel } from "@/widgets/profile/ProfileStatsPanel";

export function ProfilePage() {
  const { data, isLoading, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { message, clearMessage } = useMutationFeedback(updateProfileMutation.error);

  return (
    <PageContainer
      title="Profile"
      subtitle="Keep your Orbit presence current with a polished profile, visible activity, and clear community context."
    >
      <div className="space-y-6">
        {message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>{message}</span>
              <Button variant="ghost" size="sm" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!data}
          onRetry={() => void refetch()}
          loadingFallback={<LoadingState data-testid="profile-loading" />}
          errorTitle="We couldn't load your profile right now"
          errorDescription="Retry to request the latest profile, activity, and membership context from Orbit."
          emptyTitle="Profile details are unavailable"
          emptyDescription="Orbit couldn't find a profile payload yet. Refresh once your account data is ready."
        >
          <>
            <ProfileHeroCard profile={data!} />
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
              <div className="space-y-6">
                <ProfileOverview
                  profile={data!}
                  isSaving={updateProfileMutation.isPending}
                  onSave={async (input) => {
                    await updateProfileMutation.mutateAsync(input);
                  }}
                />
                <ProfileActivityPreview profile={data!} />
              </div>
              <div className="space-y-6">
                <UserMetaCard profile={data!} />
                <ProfileStatsPanel profile={data!} />
              </div>
            </div>
          </>
        </AsyncState>
      </div>
    </PageContainer>
  );
}
