import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useGroups } from "@/features/groups/list-groups/model/useGroups";
import { GroupGrid } from "@/features/groups/list-groups/ui/GroupGrid";
import { useJoinGroup } from "@/features/groups/join-group/model/useJoinGroup";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { canCreateGroup } from "@/shared/lib/access/permissions";

export function GroupsPage() {
  const { user } = useAuth();
  const { data, isLoading, error, isEmpty, refetch } = useGroups();
  const joinGroupMutation = useJoinGroup();
  const { message, clearMessage } = useMutationFeedback(joinGroupMutation.error);

  return (
    <PageContainer
      title="Groups Workspace"
      subtitle="Browse active communities, track membership state, and jump into the groups that matter most."
      actions={
        <div className="flex items-center gap-3">
          {canCreateGroup(user) ? (
            <Link
              to="/groups/create"
              className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
            >
              Create group
            </Link>
          ) : null}
          <Button variant="outline" onClick={() => void refetch()}>
            Refresh groups
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {message ? (
          <section className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>{message}</span>
              <Button variant="ghost" size="sm" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          </section>
        ) : null}
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={() => void refetch()}
          loadingFallback={<LoadingState data-testid="groups-loading" lines={4} />}
          errorTitle="We couldn't load groups right now"
          errorDescription="The groups feed is temporarily unavailable. Retry to request a fresh list from the backend."
          emptyTitle="No groups are available yet"
          emptyDescription="Try refreshing the groups feed once communities are ready."
        >
          <GroupGrid
            groups={data}
            joiningGroupId={joinGroupMutation.pendingGroupId}
            onJoinGroup={(groupId) => void joinGroupMutation.joinById(groupId)}
          />
        </AsyncState>
      </div>
    </PageContainer>
  );
}
