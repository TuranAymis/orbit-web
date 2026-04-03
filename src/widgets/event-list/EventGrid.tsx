import { memo } from "react";
import type { EventListItem } from "@/entities/event/model/types";
import { EventCard } from "@/entities/event/ui/EventCard";

interface EventGridProps {
  events: EventListItem[];
}

export const EventGrid = memo(function EventGrid({ events }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
});
