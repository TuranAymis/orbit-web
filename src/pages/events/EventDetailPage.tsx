import { useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useDeleteEvent } from "@/features/events/delete-event/model/useDeleteEvent";
import { useEventDetail } from "@/features/events/get-event-detail/model/useEventDetail";
import { canDeleteEvent } from "@/shared/lib/access/permissions";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { InlineConfirmCard } from "@/shared/ui/InlineConfirmCard";
import { EventDetailLayout } from "@/widgets/event-detail/EventDetailLayout";

function EventDetailLoadingState() {
  return (
    <div data-testid="event-detail-loading" className="space-y-6">
      <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
    </div>
  );
}

function EventDetailErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          We couldn't load this event right now
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          Retry to request the latest event detail payload from the backend.
        </p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function EventAboutPanel({ description }: { description: string }) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">About this event</h2>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function EventDetailPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { user } = useAuth();
  const {
    data,
    isLoading,
    error,
    refetch,
    toggleAttendance,
    isMutatingAttendance,
    attendanceError,
  } = useEventDetail(eventId);
  const deleteEventMutation = useDeleteEvent({
    eventId,
    groupId: data?.relatedGroup?.id ?? null,
  });
  const { message, clearMessage } = useMutationFeedback(
    deleteEventMutation.error ?? attendanceError,
  );

  if (isLoading) {
    return <EventDetailLoadingState />;
  }

  if (error || !data) {
    return <EventDetailErrorState onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-4">
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
          title="Delete this event?"
          description="This permanently removes the event from Orbit. The backend still validates whether you can delete it."
          confirmLabel="Delete event"
          isConfirming={deleteEventMutation.isPending}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => {
            void (async () => {
              try {
                await deleteEventMutation.mutateAsync();
              } catch {
                return;
              }

              setIsConfirmingDelete(false);
              navigate("/events");
            })();
          }}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        />
      ) : null}
      <EventDetailLayout
        event={data}
        isMutatingAttendance={isMutatingAttendance}
        onToggleAttendance={() => void toggleAttendance()}
        mainContent={<EventAboutPanel description={data.description} />}
        heroActions={
          canDeleteEvent(user) ? (
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setIsConfirmingDelete(true)}
            >
              Delete Event
            </Button>
          ) : null
        }
      />
    </div>
  );
}
