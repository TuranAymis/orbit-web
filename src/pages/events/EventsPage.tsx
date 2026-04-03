import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { useEvents } from "@/features/events/list-events/model/useEvents";
import { EventGrid } from "@/widgets/event-list/EventGrid";
import { EventListFilters } from "@/widgets/event-list/EventListFilters";

function EventsLoadingState() {
  return (
    <div data-testid="events-loading" className="space-y-6">
      <div className="h-20 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}

function EventsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">
          We couldn't load events right now
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          The event module is temporarily unavailable. Retry to request a fresh list
          from the backend.
        </p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function EventsEmptyState() {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-foreground">
          No upcoming events right now
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Check back soon for new workshops, launches, and community sessions.
        </p>
      </CardContent>
    </Card>
  );
}

export function EventsPage() {
  const { data, isLoading, error, isEmpty, refetch } = useEvents();

  return (
    <PageContainer
      title="Community Events"
      subtitle="Discover upcoming sessions, community launches, and live experiences across Orbit."
      actions={<Button variant="outline">Create event</Button>}
    >
      <div className="space-y-6">
        <EventListFilters />
        {isLoading ? <EventsLoadingState /> : null}
        {!isLoading && error ? (
          <EventsErrorState onRetry={() => void refetch()} />
        ) : null}
        {!isLoading && !error && isEmpty ? <EventsEmptyState /> : null}
        {!isLoading && !error && !isEmpty ? <EventGrid events={data} /> : null}
      </div>
    </PageContainer>
  );
}
