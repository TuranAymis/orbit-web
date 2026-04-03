import { UsersRound } from "lucide-react";
import type { Group } from "@/entities/group/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="group overflow-hidden border-white/10 bg-white/[0.03] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.05]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        <img
          src={group.imageUrl}
          alt={group.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
          <UsersRound className="h-3.5 w-3.5 text-primary" />
          <span>{group.memberCount.toLocaleString()} members</span>
        </div>
      </div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {group.name}
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {group.description}
          </p>
        </div>
        <Button className="w-full justify-center">Join group</Button>
      </CardContent>
    </Card>
  );
}
