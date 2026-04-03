import { useEffect, useState } from "react";
import type { UserSettings } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { AccountPreferencesSection } from "@/widgets/settings/AccountPreferencesSection";
import { NotificationPreferencesSection } from "@/widgets/settings/NotificationPreferencesSection";
import { PrivacyPreferencesSection } from "@/widgets/settings/PrivacyPreferencesSection";

interface SettingsFormProps {
  settings: UserSettings;
  onSave: (nextSettings: UserSettings) => Promise<void>;
  isSaving?: boolean;
}

export function SettingsForm({
  settings,
  onSave,
  isSaving = false,
}: SettingsFormProps) {
  const [values, setValues] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setValues(settings);
  }, [settings]);

  return (
    <div className="space-y-6">
      <NotificationPreferencesSection values={values} onChange={setValues} />
      <AccountPreferencesSection values={values} onChange={setValues} />
      <PrivacyPreferencesSection values={values} onChange={setValues} />
      <div className="flex items-center gap-4">
        <Button
          onClick={async () => {
            await onSave(values);
            setShowSuccess(true);
          }}
          disabled={isSaving}
        >
          {isSaving ? "Saving settings..." : "Save settings"}
        </Button>
        {showSuccess ? (
          <p className="text-sm text-primary">Settings saved.</p>
        ) : null}
      </div>
    </div>
  );
}
