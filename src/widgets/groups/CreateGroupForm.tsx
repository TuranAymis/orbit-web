import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent } from "@/shared/ui/card";
import type { CreateGroupInput } from "@/features/groups/create-group/api/createGroup";

interface CreateGroupFormProps {
  isSubmitting?: boolean;
  onSubmit: (input: CreateGroupInput) => Promise<void>;
}

export function CreateGroupForm({
  isSubmitting = false,
  onSubmit,
}: CreateGroupFormProps) {
  const [form, setForm] = useState<CreateGroupInput>({
    name: "",
    description: "",
    category: "",
    location: "",
    coverImageUrl: "",
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
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="group-name">
                Group name
              </label>
              <Input
                id="group-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Orbit Builders"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="group-category">
                Category
              </label>
              <Input
                id="group-category"
                value={form.category ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
                placeholder="Engineering"
              />
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="group-location">
                Location
              </label>
              <Input
                id="group-location"
                value={form.location ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="Remote-first"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="group-cover">
                Cover image URL
              </label>
              <Input
                id="group-cover"
                value={form.coverImageUrl ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, coverImageUrl: event.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="group-description">
              Description
            </label>
            <textarea
              id="group-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="What makes this group worth joining?"
              className="min-h-32 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-white/20"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !form.name.trim()}>
            {isSubmitting ? "Creating group..." : "Create group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
