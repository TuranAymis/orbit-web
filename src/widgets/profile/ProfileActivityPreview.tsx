import type { UserProfile } from "@/entities/user/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface ProfileActivityPreviewProps {
  profile: UserProfile;
}

export function ProfileActivityPreview({ profile }: ProfileActivityPreviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
        <div className="space-y-3">
          {profile.activityPreview.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
            >
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
