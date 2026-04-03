import type { EventDetail } from "@/entities/event/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface EventMetaCardProps {
  event: EventDetail;
}

export function EventMetaCard({ event }: EventMetaCardProps) {
  const meta = [
    { label: "Starts", value: new Date(event.startsAt).toLocaleString("en-US") },
    { label: "Ends", value: new Date(event.endsAt).toLocaleString("en-US") },
    { label: "Attendees", value: event.attendeeCount.toLocaleString() },
  ];

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="grid gap-4 md:grid-cols-3">
        {meta.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-3 text-sm font-medium text-foreground">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
