import type { UserProfile } from "@/entities/user/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface UserMetaCardProps {
  profile: UserProfile;
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function UserMetaCard({ profile }: UserMetaCardProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Profile details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Location</p>
            <p className="mt-2 text-sm font-medium text-foreground">{profile.location}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Joined</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {formatDateLabel(profile.joinedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
