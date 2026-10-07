import { useEffect, useMemo, useState } from "react";
import { Shield, ExternalLink } from "lucide-react";
import type { UserSettings } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";

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
    setShowSuccess(false);
  }, [settings]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(settings),
    [settings, values],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-6xl font-bold tracking-tight text-foreground">Account Settings</h1>
          <h2 className="sr-only">Settings Center</h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Manage your synthetic identity and digital presence.
          </p>
        </div>

        <Card className="border-white/8 bg-[#15151b]">
          <CardContent className="space-y-6 p-7">
            <div className="flex items-center gap-5">
              <div className="flex h-32 w-32 items-center justify-center rounded-[28px] border border-primary/20 bg-[#556172]">
                <span className="text-xl font-semibold text-white">PROFILE</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-foreground">Public Profile</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  This is how the Orbit community sees you.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-3 text-sm text-foreground">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Display Name
                </span>
                <Input defaultValue="Felix Vance" />
              </label>
              <label className="space-y-3 text-sm text-foreground">
                <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Username
                </span>
                <Input defaultValue="@felix_v" />
              </label>
            </div>

            <label className="space-y-3 text-sm text-foreground">
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Bio</span>
              <Textarea defaultValue="Synthesizing digital noir experiences. Architect at Orbit Labs." />
            </label>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#15151b]">
          <CardContent className="space-y-5 p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-foreground">
                  Privacy Preferences
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Control your visibility and incoming communication.
                </p>
              </div>
              <Shield className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.03] px-5 py-5">
                <div>
                  <p className="text-xl font-semibold text-foreground">Public Directory</p>
                  <p className="text-sm text-muted-foreground">
                    Allow your profile to be searchable by other members.
                  </p>
                </div>
                <Switch
                  checked={values.profileVisibility === "public"}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      profileVisibility: event.target.checked ? "public" : "members",
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.03] px-5 py-5">
                <div>
                  <p className="text-xl font-semibold text-foreground">Ghost Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Hide your online status and active timestamps.
                  </p>
                </div>
                <Switch
                  checked={values.profileVisibility === "private"}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      profileVisibility: event.target.checked ? "private" : "members",
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.03] px-5 py-5">
                <div>
                  <p className="text-xl font-semibold text-foreground">Who can message you</p>
                  <p className="text-sm text-muted-foreground">
                    Manage incoming direct message requests.
                  </p>
                </div>
                <select
                  className="h-12 rounded-[16px] border border-white/10 bg-black px-4 text-sm text-foreground outline-none"
                  value={values.profileVisibility}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      profileVisibility: event.target.value as UserSettings["profileVisibility"],
                    }))
                  }
                >
                  <option value="public">Everyone</option>
                  <option value="members">Members</option>
                  <option value="private">Nobody</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#15151b]">
          <CardContent className="space-y-4 p-7">
            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Notification preferences
            </h2>
            {[
              {
                label: "Email notifications",
                checked: values.emailNotifications,
                key: "emailNotifications" as const,
              },
              {
                label: "Push notifications",
                checked: values.pushNotifications,
                key: "pushNotifications" as const,
              },
              {
                label: "Marketing emails",
                checked: values.marketingEmails,
                key: "marketingEmails" as const,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-[22px] bg-white/[0.03] px-5 py-5"
              >
                <span className="text-xl font-semibold text-foreground">{item.label}</span>
                <Switch
                  aria-label={item.label}
                  checked={item.checked}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      [item.key]: event.target.checked,
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#15151b]">
          <CardContent className="grid gap-5 p-7 md:grid-cols-2">
            <label className="space-y-3 text-sm text-foreground">
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Theme preference
              </span>
              <select
                aria-label="Theme preference"
                className="h-12 w-full rounded-[16px] border border-white/10 bg-black px-4 text-sm text-foreground outline-none"
                value={values.themePreference}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    themePreference: event.target.value as UserSettings["themePreference"],
                  }))
                }
              >
                <option value="system">System</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="space-y-3 text-sm text-foreground">
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Language
              </span>
              <select
                aria-label="Language"
                className="h-12 w-full rounded-[16px] border border-white/10 bg-black px-4 text-sm text-foreground outline-none"
                value={values.language}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    language: event.target.value,
                  }))
                }
              >
                <option value="en">English</option>
                <option value="tr">Turkish</option>
              </select>
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-white/8 bg-[#15151b]">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold tracking-tight text-foreground">Documentation</p>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              API access, onboarding guides, and advanced Orbit configuration references.
            </p>
          </CardContent>
        </Card>
      </div>

      {hasUnsavedChanges ? (
        <div className="fixed bottom-6 left-1/2 z-30 flex w-[min(720px,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-[#1a1a1f]/95 px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">
              {showSuccess ? "Changes saved" : "You have unsaved changes"}
            </p>
            <p className="text-sm text-muted-foreground">
              {showSuccess
                ? "Your Orbit preferences were updated successfully."
                : "Reset or save your updated preferences."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setValues(settings)}>
              Reset
            </Button>
            <Button
              disabled={isSaving}
              onClick={async () => {
                await onSave(values);
                setShowSuccess(true);
              }}
            >
              {isSaving ? "Saving settings..." : "Save settings"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
