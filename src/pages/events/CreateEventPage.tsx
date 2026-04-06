import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useCreateEvent } from "@/features/events/create-event/model/useCreateEvent";
import { useGroups } from "@/features/groups/list-groups/model/useGroups";
import { canCreateEvent } from "@/shared/lib/access/permissions";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { ForbiddenState } from "@/shared/ui/ForbiddenState";
import { Button } from "@/shared/ui/button";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { PageContainer } from "@/shared/ui/page-container";
import { CreateEventForm } from "@/widgets/events/CreateEventForm";

export function CreateEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: groups, isLoading, error, isEmpty, refetch } = useGroups();
  const createEventMutation = useCreateEvent();
  const { message, clearMessage } = useMutationFeedback(createEventMutation.error);

  if (!canCreateEvent(user)) {
    return (
      <PageContainer
        title="Create Event"
        subtitle="Only moderators and admins can start new event workflows."
      >
        <ForbiddenState
          title="Event creation requires moderator or admin access"
          description="Orbit lets moderators and admins attempt event creation. The backend still validates whether you can create events for a specific group."
          actionLabel="Back to events"
          onAction={() => navigate("/events")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Create Event"
      subtitle="Set up a new event and let the backend validate whether you can create it for the selected group."
    >
      <div className="space-y-6">
        {message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>{message}</span>
              <Button variant="ghost" size="sm" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={() => void refetch()}
          loadingFallback={<LoadingState data-testid="create-event-loading" lines={4} />}
          errorTitle="We couldn't load groups for event creation"
          errorDescription="Retry to request the latest group list before creating an event."
          emptyTitle="No groups are available yet"
          emptyDescription="Orbit needs at least one group before a new event can be created."
        >
          <CreateEventForm
            groups={groups}
            initialGroupId={searchParams.get("groupId") ?? undefined}
            isSubmitting={createEventMutation.isPending}
            onSubmit={async (input) => {
              try {
                const createdEvent = await createEventMutation.mutateAsync(input);
                navigate(`/events/${createdEvent.id}`);
              } catch {
                return;
              }
            }}
          />
        </AsyncState>
      </div>
    </PageContainer>
  );
}
