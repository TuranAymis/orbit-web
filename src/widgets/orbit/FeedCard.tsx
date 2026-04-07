import { Heart, MessageSquare, Share2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";

interface FeedCardProps {
  author: string;
  meta: string;
  title: string;
  description: string;
  imageUrl?: string;
  tag?: string;
  likes?: string;
  comments?: string;
}

export function FeedCard({
  author,
  meta,
  title,
  description,
  imageUrl,
  tag,
  likes = "1.2k",
  comments = "84",
}: FeedCardProps) {
  return (
    <Card className="overflow-hidden border-white/8 bg-[#15151b]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-2xl">
              <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold tracking-tight text-foreground">{author}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{meta}</p>
            </div>
          </div>
          {tag ? <Badge>{tag}</Badge> : null}
        </div>

        <div className="space-y-3">
          <h3 className="text-[2rem] font-bold tracking-tight text-foreground">{title}</h3>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">{description}</p>
        </div>

        {imageUrl ? (
          <div className="overflow-hidden rounded-[24px] border border-white/8">
            <img src={imageUrl} alt={title} className="h-[300px] w-full object-cover" />
          </div>
        ) : null}

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {likes}
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {comments}
          </span>
          <span className="inline-flex items-center gap-2">
            <Share2 className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
