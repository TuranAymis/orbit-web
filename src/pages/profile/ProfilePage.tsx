import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { useProfile } from "@/features/profile/get-profile/model/useProfile";
import { useUpdateProfile } from "@/features/profile/update-profile/model/useUpdateProfile";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { AsyncState } from "@/shared/ui/AsyncState";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { PageContainer } from "@/shared/ui/page-container";
import { Tabs } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";
import { FeedCard } from "@/widgets/orbit/FeedCard";
import { StatCard } from "@/widgets/orbit/StatCard";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Link } from "react-router-dom";

type ProfileTab = "feed" | "projects" | "media";

export function ProfilePage() {
  const { data, isLoading, error, refetch } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { message, clearMessage } = useMutationFeedback(updateProfileMutation.error);
  const [activeTab, setActiveTab] = useState<ProfileTab>("feed");
  const [draft, setDraft] = useState({
    name: "",
    bio: "",
    location: "",
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setDraft({
      name: data.name,
      bio: data.bio,
      location: data.location,
    });
  }, [data]);

  const metrics = useMemo(
    () =>
      data
        ? [
            { label: "Followers", value: `${(data.stats.messagesSent * 3.1).toFixed(1)}k` },
            { label: "Groups", value: data.stats.groupsJoined },
            { label: "Nodes", value: data.stats.eventsAttended + data.stats.messagesSent },
          ]
        : [],
    [data],
  );

  return (
    <PageContainer title="Profile" subtitle="Orbit profile header, metrics, and activity feed.">
      <div className="space-y-6">
        {message ? (
          <div className="rounded-[22px] border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>{message}</span>
              <Button size="sm" variant="ghost" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}

        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!data}
          onRetry={() => void refetch()}
          loadingFallback={<LoadingState data-testid="profile-loading" />}
          emptyTitle="Profile details are unavailable"
          emptyDescription="Orbit couldn't find a current profile payload."
          errorTitle="We couldn't load your profile right now"
          errorDescription="Try refreshing to fetch the latest profile information."
        >
          {data ? (
            <>
              <Card className="overflow-hidden border-white/8 bg-[#14141a]">
                <div className="relative min-h-[260px]">
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(57,108,142,0.35),rgba(14,14,20,0.96)),linear-gradient(90deg,rgba(24,24,35,0.6),rgba(182,100,255,0.08))]" />
                  <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end">
                      <div className="relative">
                        <Avatar className="h-40 w-40 rounded-[34px] border-[3px] border-black">
                          <AvatarFallback className="text-4xl">
                            {data.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2">Elite</Badge>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h1 className="text-6xl font-bold tracking-tight text-foreground">
                            {data.name}
                          </h1>
                          <p className="mt-2 text-2xl text-muted-foreground">
                            {data.bio || "Synthetic interface architect"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-8">
                          {metrics.map((metric) => (
                            <div key={metric.label}>
                              <p className="text-4xl font-bold tracking-tight text-primary">
                                {metric.value}
                              </p>
                              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                                {metric.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button variant="secondary">
                      <Pencil className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
                <div className="space-y-6">
                  <StatCard label="Core Metrics" value="88%" hint="Cognitive Load" />
                  <Card className="border-white/8 bg-[#15151b]">
                    <CardContent className="space-y-4 p-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Affiliated Groups
                      </p>
                      <p className="text-sm text-muted-foreground">{data.location}</p>
                      <div className="grid grid-cols-2 gap-4">
                        {["VOID_NET", "ENCRYPTION_DAO"].map((group) => (
                          <div
                            key={group}
                            className="rounded-[22px] border border-white/8 bg-black/40 px-4 py-8 text-center text-sm font-semibold text-foreground"
                          >
                            {group}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/8 bg-[#15151b]">
                    <CardContent className="space-y-4 p-6">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Profile Editor
                      </p>
                      <label className="space-y-2 text-sm text-foreground">
                        <span>Name</span>
                        <Input
                          value={draft.name}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, name: event.target.value }))
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm text-foreground">
                        <span>Location</span>
                        <Input
                          value={draft.location}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, location: event.target.value }))
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm text-foreground">
                        <span>Bio</span>
                        <Textarea
                          value={draft.bio}
                          onChange={(event) =>
                            setDraft((current) => ({ ...current, bio: event.target.value }))
                          }
                        />
                      </label>
                      <Button
                        className="w-full justify-center"
                        disabled={updateProfileMutation.isPending}
                        onClick={async () => {
                          await updateProfileMutation.mutateAsync({
                            name: draft.name,
                            location: draft.location,
                            bio: draft.bio,
                          });
                        }}
                      >
                        {updateProfileMutation.isPending ? "Saving profile..." : "Save Profile"}
                      </Button>
                    </CardContent>
                  </Card>

                  {data.stats.groupsJoined === 0 &&
                  data.stats.eventsAttended === 0 &&
                  data.stats.messagesSent === 0 ? (
                    <Card className="border-white/8 bg-[#15151b]">
                      <CardContent className="space-y-4 p-6">
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                          Your Orbit profile is ready to grow
                        </h3>
                        <p className="text-base leading-8 text-muted-foreground">
                          Join your first group, attend an event, or start a conversation to bring this space to life.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Link to="/discover">
                            <Button variant="secondary">Join your first group</Button>
                          </Link>
                          <Link to="/chat">
                            <Button variant="outline">Start a conversation</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      items={[
                        { value: "feed", label: "Feed" },
                        { value: "projects", label: "Projects" },
                        { value: "media", label: "Media" },
                      ]}
                    />
                  </div>

                  <FeedCard
                    author={data.name}
                    meta="2 hours ago • system_sync"
                    title={data.activityPreview[0]?.title ?? "Finalized the neural architecture update"}
                    description={
                      data.activityPreview[0]?.description ??
                      "Latency benchmarks are stable and the simulation is ready for tonight."
                    }
                    imageUrl={data.avatarUrl ?? undefined}
                    tag={data.membershipTier}
                  />

                  {data.activityPreview.slice(1).map((activity) => (
                    <Card key={activity.id} className="border-white/8 bg-[#15151b]">
                      <CardContent className="space-y-5 p-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 rounded-2xl">
                            <AvatarFallback>{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-2xl font-semibold tracking-tight text-foreground">
                              {data.name}
                            </p>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-[24px] border border-primary/20 bg-black px-6 py-5 text-2xl italic leading-10 text-foreground">
                          "{activity.description}"
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </AsyncState>
      </div>
    </PageContainer>
  );
}
