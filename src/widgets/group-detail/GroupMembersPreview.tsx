import type { GroupDetail } from "@/entities/group/model/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupMembersPreviewProps {
  group: GroupDetail;
}

export function GroupMembersPreview({ group }: GroupMembersPreviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Member preview</h3>
        <div className="space-y-3">
          {group.memberPreview.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{member.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {member.role ?? "Member"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
