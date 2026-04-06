import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";

interface GroupGalleryPreviewProps {
  group: GroupDetail;
}

export function GroupGalleryPreview({ group }: GroupGalleryPreviewProps) {
  if (group.galleryPreview.length === 0) {
    return (
      <EmptyState
        title="No gallery items yet"
        description="This group has not shared any community snapshots yet. Once media is added, it will appear here."
      />
    );
  }

  return (
    <Card className="border-white/10 bg-white/[0.03]">
      <CardContent className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Community snapshots</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {group.galleryPreview.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
            >
              <img
                src={item.imageUrl}
                alt={item.alt}
                className="h-44 w-full object-cover"
              />
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-sm text-muted-foreground">{item.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
