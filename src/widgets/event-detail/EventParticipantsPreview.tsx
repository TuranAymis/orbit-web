import type { EventDetail } from "@/entities/event/model/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Card, CardContent } from "@/shared/ui/card";

interface EventParticipantsPreviewProps {
  event: EventDetail;
}

export function EventParticipantsPreview({ event }: EventParticipantsPreviewProps) {
  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Participants preview</h3>
        <div className="space-y-3">
          {event.participantsPreview.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>{participant.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {participant.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {participant.role ?? "Participant"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
