import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useGroups } from "@/features/groups/list-groups/model/useGroups";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import { canCreateGroup } from "@/shared/lib/access/permissions";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { AsyncState } from "@/shared/ui/AsyncState";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PageContainer } from "@/shared/ui/page-container";
import { GroupCard } from "@/entities/group/ui/GroupCard";

const filters = ["All Pulse", "Neuro-Art", "Synth-Noir", "Hardware"] as const;

export function GroupsPage() {
  const { user } = useAuth();
  const { data, isLoading, error, isEmpty, refetch } = useGroups();
  const joinGroupMutation = useJoinGroup();
  const { message, clearMessage } = useMutationFeedback(joinGroupMutation.error);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All Pulse");

  const filteredGroups = useMemo(
    () =>
      data.filter((group) =>
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, search],
  );

  const joinedCount = data.filter((group) => group.isJoined).length;

  return (
    <PageContainer
      title="Discover Groups"
      subtitle="Join curated collectives across Orbit without disturbing the current membership and join-state logic."
      actions={
        <div className="flex items-center gap-3">
          {canCreateGroup(user) ? (
            <Link to="/groups/create">
              <Button variant="secondary">Create Group</Button>
            </Link>
          ) : null}
          <Button variant="outline" onClick={() => void refetch()}>
            Refresh groups
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <h2 className="sr-only">Groups Workspace</h2>
          {message ? (
            <div className="rounded-[22px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>{message}</span>
                <Button size="sm" variant="ghost" onClick={clearMessage}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search groups"
                className="pl-11"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "secondary" : "ghost"}
                  className="min-w-[132px] justify-center"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          <AsyncState
            isLoading={isLoading}
            error={error}
            isEmpty={isEmpty || filteredGroups.length === 0}
            onRetry={() => void refetch()}
            emptyTitle="No groups are available yet"
            emptyDescription="Try refreshing the groups feed once communities are ready."
            errorTitle="We couldn't load groups right now"
            errorDescription="The backend group listing failed. Try requesting a fresh payload."
          >
            <div className="grid gap-5 md:grid-cols-2">
              {filteredGroups.map((group, index) => (
                <div key={group.id} className={index > 1 ? "" : "md:min-h-[520px]"}>
                  <GroupCard
                    group={group}
                    isJoining={joinGroupMutation.pendingGroupId === group.id}
                    onJoinGroup={(groupId) => void joinGroupMutation.joinById(groupId)}
                  />
                </div>
              ))}
            </div>
          </AsyncState>
        </div>

        <aside className="space-y-6">
          <Card className="border-white/8 bg-[#14141a]">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Recommended
                </p>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              {data.slice(0, 3).map((group) => (
                <div key={group.id} className="flex items-center gap-4 rounded-[20px] px-2 py-2">
                  <img
                    src={group.imageUrl}
                    alt={group.name}
                    className="h-14 w-14 rounded-[18px] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">{group.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {group.memberCount.toLocaleString()} active
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#14141a]">
            <CardContent className="space-y-5 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                My activity
              </p>
              {data.slice(0, 3).map((group, index) => (
                <div key={group.id} className="flex gap-4">
                  <div className="relative mt-1">
                    <span className="absolute left-1.5 top-0 h-2.5 w-2.5 rounded-full bg-primary" />
                    {index < 2 ? <span className="absolute left-[7px] top-3 h-14 w-px bg-white/10" /> : null}
                  </div>
                  <div>
                    <p className="text-lg text-foreground">
                      {group.isJoined ? "Joined" : "Viewed"}{" "}
                      <span className="font-semibold text-primary">{group.name}</span>
                    </p>
                    <p className="mt-1 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                      {index === 0 ? "2 hours ago" : index === 1 ? "5 hours ago" : "Yesterday"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(182,100,255,0.08),rgba(255,255,255,0.02))]">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Member since 2024</p>
              <div className="flex items-end gap-2">
                <p className="text-5xl font-bold tracking-tight text-foreground">{joinedCount}</p>
                <p className="pb-2 text-lg text-muted-foreground">active groups</p>
              </div>
              <div className="h-3 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, Math.max(8, joinedCount * 8))}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Space for {Math.max(0, 20 - joinedCount)} more collectives.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
