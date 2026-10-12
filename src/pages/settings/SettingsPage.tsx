import { PushSettings } from "@/features/notifications/push/PushSettings";
import { useSettings } from "@/features/settings/get-settings/model/useSettings";
import { useUpdateSettings } from "@/features/settings/update-settings/model/useUpdateSettings";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageContainer } from "@/shared/ui/page-container";
import { SettingsForm } from "@/widgets/settings/SettingsForm";
import { useInstallPrompt } from "@/shared/lib/pwa/useInstallPrompt";

export function SettingsPage() {
  const { data, isLoading, error, refetch } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { message, clearMessage } = useMutationFeedback(updateSettingsMutation.error);
  const { canInstall, promptInstall } = useInstallPrompt();

  return (
    <PageContainer
      title="Settings Center"
      subtitle="Manage notifications, privacy, and account preferences with a clean settings workflow."
      actions={
        <Button variant="outline" onClick={() => void refetch()}>
          Refresh settings
        </Button>
      }
    >
      <div className="space-y-6">
        {canInstall ? (
          <section className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
            <div>
              <h2 className="text-xl font-semibold">Orbit app</h2>
              <p className="text-sm text-muted-foreground">Add Orbit to this device for quick access.</p>
            </div>
            <Button variant="outline" onClick={() => void promptInstall()}>Install app</Button>
          </section>
        ) : null}
        <PushSettings />
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
          loadingFallback={<LoadingState data-testid="settings-loading" />}
          errorTitle="We couldn't load your settings right now"
          errorDescription="Retry to request the latest notification, privacy, and account preferences from Orbit."
          emptyTitle="Settings are unavailable"
          emptyDescription="Orbit couldn't find a settings payload yet. Refresh once your preferences are ready."
        >
          <SettingsForm
            settings={data!}
            isSaving={updateSettingsMutation.isPending}
            onSave={async (nextSettings) => {
              await updateSettingsMutation.mutateAsync(nextSettings);
            }}
          />
        </AsyncState>
      </div>
    </PageContainer>
  );
}
