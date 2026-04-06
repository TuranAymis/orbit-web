import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import type { Group } from "@/entities/group/model/types";
import type { CreateEventInput } from "@/features/events/create-event/api/createEvent";

interface CreateEventFormProps {
  groups: Group[];
  initialGroupId?: string;
  isSubmitting?: boolean;
  onSubmit: (input: CreateEventInput) => Promise<void>;
}

function getDefaultDate(offsetHours: number) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

export function CreateEventForm({
  groups,
  initialGroupId,
  isSubmitting = false,
  onSubmit,
}: CreateEventFormProps) {
  const resolvedInitialGroupId = useMemo(
    () =>
      initialGroupId && groups.some((group) => group.id === initialGroupId)
        ? initialGroupId
        : groups[0]?.id ?? "",
    [groups, initialGroupId],
  );

  const [form, setForm] = useState<CreateEventInput>({
    groupId: resolvedInitialGroupId,
    title: "",
    description: "",
    coverImageUrl: "",
    location: "",
    startsAt: getDefaultDate(24),
    endsAt: getDefaultDate(25),
  });

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-5">
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(form);
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="event-group">
              Group
            </label>
            <select
              id="event-group"
              value={form.groupId}
              onChange={(event) =>
                setForm((current) => ({ ...current, groupId: event.target.value }))
              }
              className="h-10 w-full rounded-md border border-white/10 bg-transparent px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-white/20"
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id} className="bg-[#080b16]">
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="event-title">
                Event title
              </label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Orbit launch review"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="event-location">
                Location
              </label>
              <Input
                id="event-location"
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Orbit Live Room"
                required
              />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="event-starts-at">
                Starts at
              </label>
              <Input
                id="event-starts-at"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, startsAt: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="event-ends-at">
                Ends at
              </label>
              <Input
                id="event-ends-at"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endsAt: event.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="event-cover">
              Cover image URL
            </label>
            <Input
              id="event-cover"
              value={form.coverImageUrl ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, coverImageUrl: event.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="event-description">
              Description
            </label>
            <textarea
              id="event-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Share the purpose, outcomes, and who should attend."
              className="min-h-32 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/20"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !form.title.trim() || !form.groupId}>
            {isSubmitting ? "Creating event..." : "Create event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
