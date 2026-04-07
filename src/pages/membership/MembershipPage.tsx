import { useCurrentMembership } from "@/features/membership/get-membership/model/useCurrentMembership";
import { useUpgradeMembership } from "@/features/membership/upgrade-membership/model/useUpgradeMembership";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { AsyncState } from "@/shared/ui/AsyncState";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { MembershipCard } from "@/widgets/orbit/MembershipCard";
import { LoadingState } from "@/shared/ui/LoadingState";

export function MembershipPage() {
  const { data, isLoading, error, refetch } = useCurrentMembership();
  const upgradeMutation = useUpgradeMembership();
  const { message, clearMessage } = useMutationFeedback(upgradeMutation.error);

  return (
    <PageContainer
      title="Membership"
      subtitle="Subscription center for Orbit plans, feature breakdown, and premium access."
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          Refresh plan
        </Button>
      }
    >
      <div className="space-y-8">
        {message ? (
          <div className="rounded-[22px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>{message}</span>
              <Button size="sm" variant="ghost" onClick={clearMessage}>
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
          emptyTitle="Membership details are unavailable"
          emptyDescription="Orbit couldn't find an active plan record yet."
          errorTitle="We couldn't load your membership right now"
          errorDescription="Try refreshing to request the latest billing-connected data."
        >
          {data ? (
            <>
              <h2 className="sr-only">{data.tier === "premium" ? "Premium Orbit" : "Orbit Free"}</h2>
              <div className="space-y-4">
                <Badge>Subscription Center</Badge>
                <h2 className="max-w-4xl text-6xl font-bold tracking-tight text-foreground">
                  Elevate your <span className="text-primary">digital reality.</span>
                </h2>
                <p className="max-w-3xl text-xl leading-9 text-muted-foreground">
                  Choose the tier that matches your ambition. Unlock synthetic intelligence
                  tools, exclusive group access, and premium event perks.
                </p>
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                <MembershipCard
                  title="Standard"
                  price="Free"
                  subtitle="Free forever"
                  features={["Community Access", "Standard Profiles", "Public Events"]}
                  isActive={data.tier === "free"}
                  actionLabel={data.tier === "free" ? "Active Plan" : "Downgrade"}
                  actionAriaLabel={data.tier === "free" ? "Current plan" : "Free plan"}
                  disabled
                />
                <MembershipCard
                  title="Orbit Pro"
                  price="$19"
                  subtitle="/month"
                  features={[
                    "AI-Driven Event Matching",
                    "Unlimited Private Groups",
                    "Priority Chat Support",
                    "Beta Feature Early Access",
                  ]}
                  isActive={data.tier === "premium"}
                  actionLabel={data.tier === "premium" ? "Current Plan" : "Upgrade to Pro"}
                  actionAriaLabel={data.tier === "premium" ? "Current plan" : "Upgrade to premium"}
                  disabled={upgradeMutation.isPending || data.tier === "premium"}
                  onAction={() => void upgradeMutation.mutateAsync()}
                />
                <MembershipCard
                  title="Ultimate"
                  price="Custom"
                  subtitle="Enterprise tier"
                  features={["White-labeling", "Custom API Keys", "Priority onboarding"]}
                  actionLabel="Contact Sales"
                  disabled
                />
              </div>

              <div className="space-y-5">
                <h3 className="text-4xl font-bold tracking-tight text-foreground">
                  Feature Breakdown
                </h3>
                <Card className="overflow-hidden border-white/8 bg-[#15151b]">
                  <div className="grid grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] border-b border-white/8 px-7 py-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    <span>Feature</span>
                    <span>Standard</span>
                    <span className="text-primary">Pro</span>
                    <span>Ultimate</span>
                  </div>
                  {[
                    ["Monthly Member Allowance", "100 Members", "Unlimited", "Unlimited"],
                    ["Synthetic Intelligence Integration", "No", "Yes", "Yes"],
                    ["Profile Verification Badge", "No", "Yes", "Yes"],
                    ["Revenue Share Optimization", "15% Fee", "5% Fee", "Custom"],
                  ].map((row) => (
                    <div
                      key={row[0]}
                      className="grid grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] border-b border-white/8 px-7 py-6 text-sm text-foreground last:border-b-0"
                    >
                      <span className="font-semibold">{row[0]}</span>
                      <span>{row[1]}</span>
                      <span>{row[2]}</span>
                      <span>{row[3]}</span>
                    </div>
                  ))}
                </Card>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="border-white/8 bg-[#15151b]">
                  <CardContent className="space-y-3 p-6">
                    <h4 className="text-3xl font-bold tracking-tight text-foreground">
                      Can I switch plans anytime?
                    </h4>
                    <p className="text-base leading-8 text-muted-foreground">
                      Absolutely. If you upgrade, new features unlock instantly. If you
                      downgrade, your current benefits remain active until the end of the
                      billing cycle.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-white/8 bg-[#15151b]">
                  <CardContent className="space-y-3 p-6">
                    <h4 className="text-3xl font-bold tracking-tight text-foreground">
                      What are &quot;Synthetic Credits&quot;?
                    </h4>
                    <p className="text-base leading-8 text-muted-foreground">
                      Credits are used for generating AI-based event suggestions and deep-linking
                      group discovery. Pro members receive 5,000 monthly credits.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </AsyncState>
      </div>
    </PageContainer>
  );
}
