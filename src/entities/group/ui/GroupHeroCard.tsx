import { MapPin, ShieldCheck, UsersRound } from "lucide-react";
import type { GroupDetail } from "@/entities/group/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupHeroCardProps {
  group: GroupDetail;
  isMutating?: boolean;
  onToggleMembership: () => void;
}

export function GroupHeroCard({
  group,
  isMutating = false,
  onToggleMembership,
}: GroupHeroCardProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
      <div className="relative h-56 overflow-hidden border-b border-white/10 md:h-72">
        <img
          src={group.coverImageUrl}
          alt={group.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-[#080b16]/40 to-transparent" />
      </div>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                {group.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Group hub
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {group.name}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {group.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <UsersRound className="h-4 w-4 text-primary" />
                {group.memberCount.toLocaleString()} members
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {group.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Founded by {group.founder}
              </span>
            </div>
          </div>
          <Button
            className="min-w-40 justify-center"
            variant={group.isJoined ? "secondary" : "default"}
            disabled={isMutating}
            onClick={onToggleMembership}
          >
            {isMutating
              ? group.isJoined
                ? "Leaving..."
                : "Joining..."
              : group.isJoined
                ? "Leave Group"
                : "Join Group"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
