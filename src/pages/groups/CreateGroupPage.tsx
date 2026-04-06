import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { useCreateGroup } from "@/features/groups/create-group/model/useCreateGroup";
import { canCreateGroup } from "@/shared/lib/access/permissions";
import { useMutationFeedback } from "@/shared/lib/mutations/useMutationFeedback";
import { ForbiddenState } from "@/shared/ui/ForbiddenState";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";
import { CreateGroupForm } from "@/widgets/groups/CreateGroupForm";

export function CreateGroupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createGroupMutation = useCreateGroup();
  const { message, clearMessage } = useMutationFeedback(createGroupMutation.error);

  if (!canCreateGroup(user)) {
    return (
      <PageContainer
        title="Create Group"
        subtitle="Only admins can create new community hubs."
      >
        <ForbiddenState
          title="Group creation is limited to admins"
          description="Orbit lets admins create new groups. If you need a new community space, contact an admin."
          actionLabel="Back to groups"
          onAction={() => navigate("/groups")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Create Group"
      subtitle="Launch a new Orbit community space with a clear identity and a strong starting description."
    >
      <div className="space-y-6">
        {message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>{message}</span>
              <Button variant="ghost" size="sm" onClick={clearMessage}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
        <CreateGroupForm
          isSubmitting={createGroupMutation.isPending}
          onSubmit={async (input) => {
            const createdGroup = await createGroupMutation.mutateAsync(input);
            navigate(`/groups/${createdGroup.id}`);
          }}
        />
      </div>
    </PageContainer>
  );
}
