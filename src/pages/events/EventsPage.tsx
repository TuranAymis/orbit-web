import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { useEvents } from "@/features/events/list-events/model/useEvents";
import { AsyncState } from "@/shared/ui/AsyncState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { EventGrid } from "@/widgets/event-list/EventGrid";
import { EventListFilters } from "@/widgets/event-list/EventListFilters";

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
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={isEmpty}
          onRetry={() => void refetch()}
          loadingFallback={<LoadingState data-testid="events-loading" />}
          errorTitle="We couldn't load events right now"
          errorDescription="The event module is temporarily unavailable. Retry to request a fresh list from the backend."
          emptyTitle="No upcoming events right now"
          emptyDescription="Check back soon for new workshops, launches, and community sessions."
        >
          <EventGrid events={data} />
        </AsyncState>
      </div>
    </PageContainer>
  );
}
