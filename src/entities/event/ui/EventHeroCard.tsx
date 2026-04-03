import { CalendarDays, MapPin, UserRound, Users } from "lucide-react";
import type { EventDetail } from "@/entities/event/model/types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

interface EventHeroCardProps {
  event: EventDetail;
  isMutating?: boolean;
  onToggleJoin: () => void;
}

export function EventHeroCard({
  event,
  isMutating = false,
  onToggleJoin,
}: EventHeroCardProps) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
      <div className="relative h-56 overflow-hidden border-b border-white/10 md:h-72">
        <img
          src={event.coverImageUrl}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-[#080b16]/40 to-transparent" />
      </div>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                {event.category}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {event.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                {event.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {new Date(event.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {event.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                Hosted by {event.host}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {event.attendeeCount.toLocaleString()} attendees
              </span>
            </div>
          </div>
          <Button
            className="min-w-40 justify-center"
            variant={event.isJoined ? "secondary" : "default"}
            disabled={isMutating}
            onClick={onToggleJoin}
          >
            {isMutating
              ? event.isJoined
                ? "Leaving..."
                : "Joining..."
              : event.isJoined
                ? "Leave Event"
                : "Join Event"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
