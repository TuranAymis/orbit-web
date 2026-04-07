import { Card, CardContent } from "@/shared/ui/card";

interface DiscoverSectionSkeletonProps {
  itemCount?: number;
}

export function DiscoverSectionSkeleton({
  itemCount = 2,
}: DiscoverSectionSkeletonProps) {
  return (
    <section className="space-y-4" data-testid="discover-section-skeleton">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-72 animate-pulse rounded bg-white/5" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card key={index} className="border-white/8 bg-[#15151b]">
            <CardContent className="space-y-4 p-6">
              <div className="aspect-[16/10] animate-pulse rounded-[20px] bg-white/5" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
