import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupAboutPanelProps {
  group: GroupDetail;
}

export function GroupAboutPanel({ group }: GroupAboutPanelProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">About this group</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {group.description}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Founder
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{group.founder}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Location
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{group.location}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
