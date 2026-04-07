import type { EventListItem } from "@/entities/event/model/types";
import { EventCard } from "@/entities/event/ui/EventCard";
import { ErrorState } from "@/shared/ui/ErrorState";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DiscoverSection } from "@/widgets/discover/DiscoverSection";

interface DiscoverEventsSectionProps {
  title: string;
  description: string;
  events: EventListItem[];
  error: string | null;
  onRetry: () => void;
}

export function DiscoverEventsSection({
  title,
  description,
  events,
  error,
  onRetry,
}: DiscoverEventsSectionProps) {
  return (
    <DiscoverSection title={title} description={description}>
      {error ? (
        <ErrorState
          title="We couldn't load events right now"
          description={error}
          onAction={onRetry}
        />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events in this section yet"
          description="Orbit will show upcoming sessions here as soon as the backend returns them."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </DiscoverSection>
  );
}
