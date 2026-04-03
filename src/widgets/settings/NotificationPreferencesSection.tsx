import type { UserSettings } from "@/entities/user/model/types";

interface NotificationPreferencesSectionProps {
  values: UserSettings;
  onChange: (nextValues: UserSettings) => void;
}

export function NotificationPreferencesSection({
  values,
  onChange,
}: NotificationPreferencesSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Notification preferences</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose which Orbit updates reach you directly.
        </p>
      </div>
      <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
        <span className="text-sm text-foreground">Email notifications</span>
        <input
          type="checkbox"
          checked={values.emailNotifications}
          onChange={(event) =>
            onChange({ ...values, emailNotifications: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
        <span className="text-sm text-foreground">Push notifications</span>
        <input
          type="checkbox"
          checked={values.pushNotifications}
          onChange={(event) =>
            onChange({ ...values, pushNotifications: event.target.checked })
          }
        />
      </label>
      <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
        <span className="text-sm text-foreground">Marketing emails</span>
        <input
          type="checkbox"
          checked={values.marketingEmails}
          onChange={(event) =>
            onChange({ ...values, marketingEmails: event.target.checked })
          }
        />
      </label>
    </section>
  );
}
