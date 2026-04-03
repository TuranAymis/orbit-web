import { PageContainer } from "@/shared/ui/page-container";

export function GroupsPage() {
  return (
    <PageContainer
      title="Groups Workspace"
      subtitle="A clean foundation for joined communities, moderation tools, and participation status."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-muted-foreground">
          Group listings, role indicators, and management states will appear here.
        </p>
      </div>
    </PageContainer>
  );
}
