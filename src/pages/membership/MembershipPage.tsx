import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageContainer } from "@/shared/ui/page-container";
import { useCurrentMembership } from "@/features/membership/get-membership/model/useCurrentMembership";
import { useUpgradeMembership } from "@/features/membership/upgrade-membership/model/useUpgradeMembership";
import { MembershipOverview } from "@/widgets/membership/MembershipOverview";
import { PlanComparison } from "@/widgets/membership/PlanComparison";
import { FeatureGate } from "@/widgets/membership/FeatureGate";

export function MembershipPage() {
  const { data, isLoading, error, refetch } = useCurrentMembership();
  const upgradeMutation = useUpgradeMembership();
  const { message, clearMessage } = useMutationFeedback(upgradeMutation.error);

  return (
    <PageContainer
      title="Membership Hub"
      subtitle="Manage your current plan, premium benefits, and access rules from one dedicated surface."
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          Refresh plan
        </Button>
      }
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
          loadingFallback={<LoadingState data-testid="membership-loading" />}
          errorTitle="We couldn't load your membership right now"
          errorDescription="Retry to request the latest plan details, benefits, and access limits from Orbit."
          emptyTitle="Membership details are unavailable"
          emptyDescription="Orbit couldn't find an active plan record yet. Refresh once your account is ready."
        >
          <>
            <MembershipOverview membership={data!} />
            <PlanComparison
              membership={data!}
              isUpgrading={upgradeMutation.isPending}
              onUpgrade={() => void upgradeMutation.mutateAsync()}
            />
            <FeatureGate feature="advancedChat" membership={data!}>
              <Card className="border-white/10 bg-white/[0.03]">
                <CardContent className="space-y-3 p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Premium access looks good
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    This reusable gate can protect advanced chat tooling, private groups,
                    premium events, and future billing-connected experiences without
                    scattering tier checks across pages.
                  </p>
                </CardContent>
              </Card>
            </FeatureGate>
          </>
        </AsyncState>
      </div>
    </PageContainer>
  );
}
