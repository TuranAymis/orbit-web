import { useMemo, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useGroupDetail } from "@/features/groups/get-group-detail/model/useGroupDetail";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { GroupAboutPanel } from "@/widgets/group-detail/GroupAboutPanel";
import { GroupDetailLayout } from "@/widgets/group-detail/GroupDetailLayout";
import {
  GroupDetailTabs,
  type GroupDetailTabId,
} from "@/widgets/group-detail/GroupDetailTabs";
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

function GroupChatEntryCard({ groupId }: { groupId: string }) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Group chat entry</h3>
        <p className="text-sm leading-7 text-muted-foreground">
          Group chat stays part of the shared chat system. This tab acts as the handoff
          point into that experience without embedding a second chat surface here.
        </p>
        <Link
          to={`/chat?groupId=${encodeURIComponent(groupId)}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
        >
          Open group chat
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<GroupDetailTabId>("about");
  const {
    data,
    isLoading,
    error,
    refetch,
    toggleMembership,
    isMutatingMembership,
  } = useGroupDetail(groupId);

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
        return <GroupChatEntryCard groupId={data.id} />;
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
      <GroupDetailTabs activeTab={activeTab} onChange={setActiveTab} />
      <GroupDetailLayout
        group={data}
        isMutatingMembership={isMutatingMembership}
        onToggleMembership={() => void toggleMembership()}
        mainContent={tabContent}
      />
    </div>
  );
}
