import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { canCreateEvent } from "@/shared/lib/access/permissions";
import { useEvents } from "@/features/events/list-events/model/useEvents";
import {
  captureEventAttendanceSnapshot,
  restoreEventAttendanceCaches,
  syncEventAttendanceCaches,
} from "@/features/events/model/attendanceCache";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";
import { leaveEvent } from "@/features/events/leave-event/api/leaveEvent";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";
import { AsyncState } from "@/shared/ui/AsyncState";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { PageContainer } from "@/shared/ui/page-container";
import { Tabs } from "@/shared/ui/tabs";
import { LoadingState } from "@/shared/ui/LoadingState";
import type { EventListItem } from "@/entities/event/model/types";

type EventTab = "all" | "week" | "month";

export function EventsPage() {
  const { user } = useAuth();
  const { data, isLoading, error, isEmpty, refetch } = useEvents();
  const [activeTab, setActiveTab] = useState<EventTab>("all");
  const queryClient = useQueryClient();

  const attendanceMutation = useMutation({
    mutationFn: async (event: EventListItem) => {
      if (event.isJoined) {
        await leaveEvent(event.id);
        return { eventId: event.id, nextJoined: false };
      }

      await joinEvent(event.id);
      return { eventId: event.id, nextJoined: true };
    },
    onMutate: async (event) => {
      logMutationLifecycle("event.attendance.list-toggle", "start", {
        eventId: event.id,
        nextJoinedState: !event.isJoined,
      });

      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.events.list }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);

      const nextJoined = !event.isJoined;
      const snapshot = captureEventAttendanceSnapshot(queryClient, event.id);
      syncEventAttendanceCaches(queryClient, event.id, nextJoined);
      return snapshot;
    },
    onSuccess: (_data, event) => {
      logMutationLifecycle("event.attendance.list-toggle", "success", {
        eventId: event.id,
        nextJoinedState: !event.isJoined,
      });
    },
    onError: (_error, _event, context) => {
      if (attendanceMutation.variables) {
        logMutationLifecycle("event.attendance.list-toggle", "rollback", {
          eventId: attendanceMutation.variables.id,
        });
        restoreEventAttendanceCaches(queryClient, attendanceMutation.variables.id, context);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.events.list }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);
    },
  });

  return (
    <PageContainer
      title="Upcoming Events"
      subtitle="Curated experiences in the synthetic realm with RSVP state connected to the existing backend."
      actions={
        <div className="flex items-center gap-3">
          {canCreateEvent(user) ? (
            <Link to="/events/create">
              <Button variant="secondary">Create Event</Button>
            </Link>
          ) : null}
          <Button variant="outline" onClick={() => void refetch()}>
            Refresh events
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              items={[
                { value: "all", label: "All Time" },
                { value: "week", label: "This Week" },
                { value: "month", label: "Next Month" },
              ]}
            />
          </div>

          <AsyncState
            isLoading={isLoading}
            error={error}
            isEmpty={isEmpty}
            onRetry={() => void refetch()}
            loadingFallback={<LoadingState data-testid="events-loading" />}
            emptyTitle="No upcoming events right now"
            emptyDescription="Check back soon for new workshops, showcases, and community sessions."
            errorTitle="We couldn't load events right now"
            errorDescription="Try refreshing the events feed to re-request the backend list."
          >
            <div className="space-y-5">
              {data.map((event, index) => {
                const start = new Date(event.startsAt);

                return (
                  <Card key={event.id} className="border-white/8 bg-[#15151b]">
                    <CardContent className="flex flex-col gap-6 p-7 md:flex-row md:items-start">
                      <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[22px] bg-black">
                        <span className="text-4xl font-bold tracking-tight text-primary">
                          {start.toLocaleString("en-US", { day: "2-digit" })}
                        </span>
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          {start.toLocaleString("en-US", { month: "short" })}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge>{event.category}</Badge>
                          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
                            {start.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(event.endsAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px]">
                          <div className="space-y-4">
                            <Link to={`/events/${event.id}`}>
                              <h2 className="max-w-xl text-4xl font-bold tracking-tight text-foreground">
                                {event.title}
                              </h2>
                            </Link>
                            <p className="max-w-lg text-base leading-8 text-muted-foreground">
                              {event.description}
                            </p>
                            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 text-primary" />
                              {event.location}
                            </p>
                          </div>

                          <div className="flex flex-col justify-between gap-5">
                            <Button
                              className="w-full justify-center"
                              variant={event.isJoined ? "secondary" : "default"}
                              aria-label={event.isJoined ? "Attending" : "RSVP now"}
                              disabled={
                                attendanceMutation.isPending &&
                                attendanceMutation.variables?.id === event.id
                              }
                              onClick={() => attendanceMutation.mutate(event)}
                            >
                              {attendanceMutation.isPending &&
                              attendanceMutation.variables?.id === event.id
                                ? "Saving..."
                                : event.isJoined
                                  ? "Attending"
                                  : "RSVP Now"}
                            </Button>

                            <div className="space-y-3">
                              <div className="inline-flex -space-x-2">
                                {Array.from({ length: 3 }).map((_, avatarIndex) => (
                                  <span
                                    key={avatarIndex}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#15151b] bg-white/10 text-xs text-foreground"
                                  >
                                    {avatarIndex + 1}
                                  </span>
                                ))}
                                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#15151b] bg-white/10 text-xs text-foreground">
                                  +{Math.max(0, event.attendeeCount - 3)}
                                </span>
                              </div>
                              {index === 1 ? (
                                <button
                                  type="button"
                                  aria-label="Create event shortcut"
                                  className="flex h-16 w-16 items-center justify-center self-end rounded-full bg-primary text-primary-foreground shadow-[0_14px_40px_rgba(182,100,255,0.26)]"
                                >
                                  <Plus className="h-6 w-6" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AsyncState>
        </div>

        <aside className="space-y-6">
          <Card className="border-white/8 bg-[#14141a]">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold tracking-tight text-foreground">Timeline</p>
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, index) => {
                  const day = index + 18;
                  const isActive = day === 18 || day === 24 || day === 28;

                  return (
                    <div
                      key={day}
                      className={`flex h-12 items-center justify-center rounded-[16px] text-sm ${
                        isActive
                          ? "border border-primary/30 bg-primary/12 text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/8 bg-[#14141a]">
            <CardContent className="space-y-4 p-6">
              <p className="text-2xl font-bold tracking-tight text-foreground">My Upcoming RSVPs</p>
              {data.filter((event) => event.isJoined).slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-4 rounded-[20px] border border-white/8 bg-black/40 p-4 transition hover:border-primary/20"
                >
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="h-14 w-14 rounded-[16px] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">{event.title}</p>
                    <p className="truncate text-sm uppercase tracking-[0.16em] text-muted-foreground">
                      {new Date(event.startsAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
