import { PageContainer } from "@/shared/ui/page-container";

export function SettingsPage() {
  return (
    <PageContainer
      title="Settings Center"
      subtitle="Centralize account, notification, privacy, and interface preferences with a consistent settings scaffold."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-muted-foreground">
          Profile controls and preference forms will be added here.
        </p>
      </div>
    </PageContainer>
  );
}
