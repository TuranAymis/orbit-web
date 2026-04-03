import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { EventDetail } from "@/entities/event/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface EventRelatedGroupCardProps {
  event: EventDetail;
}

export function EventRelatedGroupCard({ event }: EventRelatedGroupCardProps) {
  if (!event.relatedGroup) {
    return null;
  }

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Related group</h3>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
          <p className="text-sm font-medium text-foreground">{event.relatedGroup.name}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {event.relatedGroup.description}
          </p>
          <Link
            to={`/groups/${event.relatedGroup.id}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Open group hub
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
