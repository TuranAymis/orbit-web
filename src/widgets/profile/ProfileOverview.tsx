import { useState } from "react";
import type { UserProfile } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

interface ProfileOverviewProps {
  profile: UserProfile;
  onSave: (input: { name: string; bio: string; location: string }) => Promise<void>;
  isSaving?: boolean;
}

export function ProfileOverview({
  profile,
  onSave,
  isSaving = false,
}: ProfileOverviewProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Profile overview</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Keep your public profile current so communities know how you work and what
            you care about.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-foreground">
            <span>Name</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm text-foreground">
            <span>Location</span>
            <Input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
        </div>
        <label className="block space-y-2 text-sm text-foreground">
          <span>Bio</span>
          <textarea
            className="min-h-28 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
        </label>
        <Button onClick={() => void onSave({ name, bio, location })} disabled={isSaving}>
          {isSaving ? "Saving profile..." : "Save profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
