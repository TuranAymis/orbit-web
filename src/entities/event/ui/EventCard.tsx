import { CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { EventListItem } from "@/entities/event/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface EventCardProps {
  event: EventListItem;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link to={`/events/${event.id}`} className="block">
      <Card className="group overflow-hidden border-white/10 bg-white/[0.03] transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.05]">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            {event.category}
          </span>
        </div>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {event.title}
            </h3>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
              {event.description}
            </p>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {new Date(event.startsAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {event.location}
            </p>
            <p className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {event.attendeeCount.toLocaleString()} attendees
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {event.isJoined ? "Joined" : "Open to join"}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
