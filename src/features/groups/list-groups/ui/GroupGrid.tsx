import type { Group } from "@/entities/group/model/types";
import { GroupCard } from "@/entities/group/ui/GroupCard";

interface GroupGridProps {
  groups: Group[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

function GroupGridSkeleton() {
  return (
    <div
      data-testid="group-grid-skeleton"
      className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <div className="aspect-[16/10] animate-pulse bg-white/10" />
          <div className="space-y-3 p-6">
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupGridEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <h3 className="text-lg font-semibold text-foreground">No groups found yet</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Try another tab or check back for fresh communities soon.
      </p>
    </div>
  );
}

export function GroupGrid({
  groups,
  isLoading = false,
  isEmpty = false,
}: GroupGridProps) {
  if (isLoading) {
    return <GroupGridSkeleton />;
  }

  if (isEmpty) {
    return <GroupGridEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
