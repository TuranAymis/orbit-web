import type { Group } from "@/entities/group/model/types";
import { GroupCard } from "@/entities/group/ui/GroupCard";
import { ErrorState } from "@/shared/ui/ErrorState";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DiscoverSection } from "@/widgets/discover/DiscoverSection";

interface DiscoverGroupsSectionProps {
  title: string;
  description: string;
  groups: Group[];
  error: string | null;
  isJoiningGroupId: string | null;
  onJoinGroup: (groupId: string) => void;
  onRetry: () => void;
}

export function DiscoverGroupsSection({
  title,
  description,
  groups,
  error,
  isJoiningGroupId,
  onJoinGroup,
  onRetry,
}: DiscoverGroupsSectionProps) {
  return (
    <DiscoverSection title={title} description={description}>
      {error ? (
        <ErrorState
          title="We couldn't load groups right now"
          description={error}
          onAction={onRetry}
        />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No groups to discover yet"
          description="Try refreshing the feed or check back once more communities are available."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isJoining={isJoiningGroupId === group.id}
              onJoinGroup={onJoinGroup}
            />
          ))}
        </div>
      )}
    </DiscoverSection>
  );
}
