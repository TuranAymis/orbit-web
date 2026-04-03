import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";

export function MembershipPage() {
  return (
    <PageContainer
      title="Membership Hub"
      subtitle="Manage your plan, perks, and community access from a dedicated membership surface."
      actions={<Button variant="secondary">Review perks</Button>}
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-muted-foreground">
          Membership insights appear here with billing summaries and access
          controls.
        </p>
      </div>
    </PageContainer>
  );
}
