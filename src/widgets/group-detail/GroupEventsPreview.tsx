import { CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";

interface GroupEventsPreviewProps {
  group: GroupDetail;
}

export function GroupEventsPreview({ group }: GroupEventsPreviewProps) {
  if (group.upcomingEvents.length === 0) {
    return (
      <EmptyState
        title="No upcoming group events yet"
        description="This community has not scheduled any upcoming sessions yet. Check back soon or explore other Orbit events in the meantime."
      />
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming events</h3>
        <div className="space-y-3">
          {group.upcomingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition hover:border-primary/30 hover:bg-black/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {new Date(event.startsAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.location || "Orbit Room"}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
