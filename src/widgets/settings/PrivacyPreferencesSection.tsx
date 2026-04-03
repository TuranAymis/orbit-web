import type { UserSettings } from "@/entities/user/model/types";

interface PrivacyPreferencesSectionProps {
  values: UserSettings;
  onChange: (nextValues: UserSettings) => void;
}

export function PrivacyPreferencesSection({
  values,
  onChange,
}: PrivacyPreferencesSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Choose who can discover your profile across Orbit.
        </p>
      </div>
      <label className="block space-y-2 text-sm text-foreground">
        <span>Profile visibility</span>
        <select
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none"
          value={values.profileVisibility}
          onChange={(event) =>
            onChange({
              ...values,
              profileVisibility: event.target.value as UserSettings["profileVisibility"],
            })
          }
        >
          <option value="public">Public</option>
          <option value="members">Members only</option>
          <option value="private">Private</option>
        </select>
      </label>
    </section>
  );
}
