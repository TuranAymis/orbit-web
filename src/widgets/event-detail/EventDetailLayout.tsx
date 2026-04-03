import type { ReactNode } from "react";
import type { EventDetail } from "@/entities/event/model/types";
import { EventHeroCard } from "@/entities/event/ui/EventHeroCard";
import { EventMetaCard } from "@/entities/event/ui/EventMetaCard";
import { EventParticipantsPreview } from "@/widgets/event-detail/EventParticipantsPreview";
import { EventRelatedGroupCard } from "@/widgets/event-detail/EventRelatedGroupCard";

interface EventDetailLayoutProps {
  event: EventDetail;
  isMutatingAttendance?: boolean;
  onToggleAttendance: () => void;
  mainContent: ReactNode;
}

export function EventDetailLayout({
  event,
  isMutatingAttendance = false,
  onToggleAttendance,
  mainContent,
}: EventDetailLayoutProps) {
  return (
    <div className="space-y-6">
      <EventHeroCard
        event={event}
        isMutating={isMutatingAttendance}
        onToggleJoin={onToggleAttendance}
      />
      <EventMetaCard event={event} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>{mainContent}</div>
        <div className="space-y-6">
          <EventParticipantsPreview event={event} />
          <EventRelatedGroupCard event={event} />
        </div>
      </div>
    </div>
  );
}
