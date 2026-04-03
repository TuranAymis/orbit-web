import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";

export function EventsPage() {
  return (
    <PageContainer
      title="Community Events"
      subtitle="Organize upcoming sessions, launches, and community meetups from a shared event surface."
      actions={<Button variant="outline">Create event</Button>}
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-muted-foreground">
          Event calendars, RSVP flows, and featured sessions will populate this
          area.
        </p>
      </div>
    </PageContainer>
  );
}
