import type { UserSettings } from "@/entities/user/model/types";

interface AccountPreferencesSectionProps {
  values: UserSettings;
  onChange: (nextValues: UserSettings) => void;
}

export function AccountPreferencesSection({
  values,
  onChange,
}: AccountPreferencesSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Account preferences</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Set your visual defaults and localization preferences.
        </p>
      </div>
      <label className="block space-y-2 text-sm text-foreground">
        <span>Theme preference</span>
        <select
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none"
          value={values.themePreference}
          onChange={(event) =>
            onChange({
              ...values,
              themePreference: event.target.value as UserSettings["themePreference"],
            })
          }
        >
          <option value="system">System</option>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <label className="block space-y-2 text-sm text-foreground">
        <span>Language</span>
        <select
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none"
          value={values.language}
          onChange={(event) => onChange({ ...values, language: event.target.value })}
        >
          <option value="en">English</option>
          <option value="tr">Turkish</option>
        </select>
      </label>
    </section>
  );
}
