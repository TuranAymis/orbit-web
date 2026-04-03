import { RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { useEventDetail } from "@/features/events/get-event-detail/model/useEventDetail";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
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
  const { eventId } = useParams<{ eventId: string }>();
  const {
    data,
    isLoading,
    error,
    refetch,
    toggleAttendance,
    isMutatingAttendance,
  } = useEventDetail(eventId);

  if (isLoading) {
    return <EventDetailLoadingState />;
  }

  if (error || !data) {
    return <EventDetailErrorState onRetry={() => void refetch()} />;
  }

  return (
    <EventDetailLayout
      event={data}
      isMutatingAttendance={isMutatingAttendance}
      onToggleAttendance={() => void toggleAttendance()}
      mainContent={<EventAboutPanel description={data.description} />}
    />
  );
}
