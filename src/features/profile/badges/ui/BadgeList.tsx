import { useBadges } from "@/features/profile/badges/model/useBadges";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { LoadingState } from "@/shared/ui/LoadingState";

export function BadgeList() {
  const { data, isLoading, isError, refetch } = useBadges();

  return (
    <Card className="border-white/8 bg-[#15151b]">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Badges</h2>
        {isLoading ? <LoadingState data-testid="badges-loading" lines={2} /> : null}
        {isError ? (
          <div role="alert" className="space-y-2 text-sm text-muted-foreground">
            <p>We couldn't load your badges.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>Retry</Button>
          </div>
        ) : null}
        {data?.length === 0 ? <p className="text-sm text-muted-foreground">No badges are available yet.</p> : null}
        {data && data.length > 0 ? (
          <ul className="space-y-3">
            {data.map((badge) => (
              <li key={badge.key} className="rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{badge.title}</h3>
                  <Badge variant={badge.earned ? "default" : "muted"}>
                    {badge.earned ? "Earned" : "Locked"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{badge.description}</p>
                {badge.awardedAt ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Earned {new Date(badge.awardedAt).toLocaleDateString("en-US")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
