import { ArrowRight, MessageSquareText, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupChatPreviewProps {
  group: GroupDetail;
}

export function GroupChatPreview({ group }: GroupChatPreviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <MessageSquareText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Group chat</h3>
            <p className="text-sm text-muted-foreground">
              Continue the conversation in Orbit chat without leaving this community context behind.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Active members
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <UsersRound className="h-4 w-4 text-primary" />
              {group.stats.activeMembers.toLocaleString()} currently active
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Best for
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Quick updates, event coordination, and keeping community momentum moving.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Community pulse
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {group.name} has {group.memberCount.toLocaleString()} members and{" "}
            {group.stats.weeklyPosts.toLocaleString()} weekly posts. Open the dedicated chat
            workspace to follow the live channel flow for this group.
          </p>
        </div>
        <Link
          to={`/chat?groupId=${encodeURIComponent(group.id)}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
        >
          Open group chat
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
