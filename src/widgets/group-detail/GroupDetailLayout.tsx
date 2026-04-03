import type { ReactNode } from "react";
import type { GroupDetail } from "@/entities/group/model/types";
import { GroupHeroCard } from "@/entities/group/ui/GroupHeroCard";
import { GroupStatsCard } from "@/entities/group/ui/GroupStatsCard";
import { GroupMembersPreview } from "@/widgets/group-detail/GroupMembersPreview";

interface GroupDetailLayoutProps {
  group: GroupDetail;
  isMutatingMembership?: boolean;
  onToggleMembership: () => void;
  mainContent: ReactNode;
}

export function GroupDetailLayout({
  group,
  isMutatingMembership = false,
  onToggleMembership,
  mainContent,
}: GroupDetailLayoutProps) {
  return (
    <div className="space-y-6">
      <GroupHeroCard
        group={group}
        isMutating={isMutatingMembership}
        onToggleMembership={onToggleMembership}
      />
      <GroupStatsCard group={group} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>{mainContent}</div>
        <div className="space-y-6">
          <GroupMembersPreview group={group} />
        </div>
      </div>
    </div>
  );
}
