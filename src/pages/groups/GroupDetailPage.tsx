import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDeleteGroup } from "@/features/groups/delete-group/model/useDeleteGroup";
import { useGroupDetail } from "@/features/groups/get-group-detail/model/useGroupDetail";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { useAuth } from "@/features/auth/useAuth";
import { canCreateEvent, canDeleteGroup } from "@/shared/lib/access/permissions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { InlineConfirmCard } from "@/shared/ui/InlineConfirmCard";
import { GroupAboutPanel } from "@/widgets/group-detail/GroupAboutPanel";
import { GroupDetailLayout } from "@/widgets/group-detail/GroupDetailLayout";
import {
  GroupDetailTabs,
  type GroupDetailTabId,
} from "@/widgets/group-detail/GroupDetailTabs";
import { GroupChatPreview } from "@/widgets/group-detail/GroupChatPreview";
import { GroupEventsPreview } from "@/widgets/group-detail/GroupEventsPreview";
import { GroupGalleryPreview } from "@/widgets/group-detail/GroupGalleryPreview";

function GroupDetailLoadingState() {
  return (
    <div
      data-testid="group-detail-loading"
      className="space-y-6"
    >
      <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
    </div>
  );
}

function GroupDetailErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          We couldn't load this group right now
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          The group hub is temporarily unavailable. Try again and we’ll request the
          latest detail payload from the backend.
        </p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function isGroupDetailTab(value: string | null): value is GroupDetailTabId {
  return value === "about" || value === "events" || value === "gallery" || value === "chat";
}

export function GroupDetailPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { user } = useAuth();
  const {
    data,
    isLoading,
    error,
    refetch,
    toggleMembership,
    isMutatingMembership,
    membershipError,
  } = useGroupDetail(groupId);
  const deleteGroupMutation = useDeleteGroup(groupId);
  const { message, clearMessage } = useMutationFeedback(
    deleteGroupMutation.error ?? membershipError,
  );
  const requestedTab = searchParams.get("tab");
  const activeTab: GroupDetailTabId = isGroupDetailTab(requestedTab)
    ? requestedTab
    : "about";

  const tabContent = useMemo(() => {
    if (!data) {
      return null;
    }

    switch (activeTab) {
      case "about":
        return <GroupAboutPanel group={data} />;
      case "events":
        return <GroupEventsPreview group={data} />;
      case "gallery":
        return <GroupGalleryPreview group={data} />;
      case "chat":
        return <GroupChatPreview group={data} />;
      default:
        return null;
    }
  }, [activeTab, data]);

  if (isLoading) {
    return <GroupDetailLoadingState />;
  }

  if (error || !data) {
    return <GroupDetailErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      {message ? (
        <Card className="border-destructive/40 bg-destructive/10">
          <CardContent className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">{message}</p>
            <Button variant="outline" size="sm" onClick={clearMessage}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
        ) : null}
      {isConfirmingDelete ? (
        <InlineConfirmCard
          title="Delete this group?"
          description="This permanently removes the group from Orbit. The backend will still enforce admin-only deletion."
          confirmLabel="Delete group"
          isConfirming={deleteGroupMutation.isPending}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => {
            void (async () => {
              try {
                await deleteGroupMutation.mutateAsync();
              } catch {
                return;
              }

              setIsConfirmingDelete(false);
              navigate("/groups");
            })();
          }}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GroupDetailTabs
          activeTab={activeTab}
          onChange={(nextTab) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.set("tab", nextTab);
            setSearchParams(nextSearchParams, { replace: true });
          }}
        />
        {canCreateEvent(user) ? (
          <Link
            to={`/events/create?groupId=${encodeURIComponent(data.id)}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
          >
            Create event for this group
          </Link>
        ) : null}
      </div>
      <GroupDetailLayout
        group={data}
        isMutatingMembership={isMutatingMembership}
        onToggleMembership={() => void toggleMembership()}
        mainContent={tabContent}
        heroActions={
          canDeleteGroup(user) ? (
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setIsConfirmingDelete(true)}
            >
              Delete Group
            </Button>
          ) : null
        }
      />
    </div>
  );
}
