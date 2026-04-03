import type { GroupDetail } from "@/entities/group/model/types";
import { Card, CardContent } from "@/shared/ui/card";

interface GroupGalleryPreviewProps {
  group: GroupDetail;
}

export function GroupGalleryPreview({ group }: GroupGalleryPreviewProps) {
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
