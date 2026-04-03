import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupEventsPreviewProps {
  group: GroupDetail;
}

export function GroupEventsPreview({ group }: GroupEventsPreviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming events</h3>
        {group.upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
        ) : (
          group.upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
            >
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(event.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
