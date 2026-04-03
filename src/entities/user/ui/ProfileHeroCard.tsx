import type { UserProfile } from "@/entities/user/model/types";
import { MembershipBadge } from "@/entities/membership/ui/MembershipBadge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";

interface ProfileHeroCardProps {
  profile: UserProfile;
}

export function ProfileHeroCard({ profile }: ProfileHeroCardProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{profile.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {profile.bio}
            </p>
          </div>
        </div>
        <MembershipBadge
          tier={profile.membershipTier.toLowerCase() === "premium" ? "premium" : "free"}
        />
      </CardContent>
    </Card>
  );
}
