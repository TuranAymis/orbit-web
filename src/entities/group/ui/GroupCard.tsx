import { UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { Group } from "@/entities/group/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupCardProps {
  group: Group;
  onJoinGroup?: (groupId: string) => void;
  isJoining?: boolean;
  href?: string;
}

export function GroupCard({
  group,
  onJoinGroup,
  isJoining = false,
  href = `/groups/${group.id}`,
}: GroupCardProps) {
  return (
    <Card className="group overflow-hidden border-white/8 bg-[#15151b] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_50px_rgba(182,100,255,0.10)]">
      <Link
        to={href}
        aria-label={`Open ${group.name}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/8">
          <img
            src={group.imageUrl}
            alt={group.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary backdrop-blur">
            {group.isJoined ? "Joined" : "Trending"}
          </div>
          <div className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
            <UsersRound className="h-3.5 w-3.5 text-primary" />
            <span>{group.memberCount.toLocaleString()} members</span>
          </div>
        </div>
        <CardContent className="space-y-3">
          <h3 className="text-4xl font-bold tracking-tight text-foreground">
            {group.name}
          </h3>
          <p className="line-clamp-3 text-base leading-8 text-muted-foreground">
            {group.description}
          </p>
        </CardContent>
      </Link>
      <CardContent className="pt-0">
        <Button
          className="w-full justify-center uppercase tracking-[0.16em]"
          variant={group.isJoined ? "secondary" : "default"}
          aria-label={group.isJoined ? "Joined" : "Join group"}
          disabled={isJoining || group.isJoined}
          onClick={(event) => {
            event.stopPropagation();
            onJoinGroup?.(group.id);
          }}
        >
          {isJoining ? "Joining..." : group.isJoined ? "Joined" : "Join Pulse"}
        </Button>
      </CardContent>
    </Card>
  );
}
