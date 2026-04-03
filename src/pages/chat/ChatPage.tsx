import { PageContainer } from "@/shared/ui/page-container";

export function ChatPage() {
  return (
    <PageContainer
      title="Realtime Chat"
      subtitle="Prepare the messaging canvas, conversations rail, and room context within the shared shell."
    >
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-muted-foreground">
          Conversation threads and message panels will be layered onto this page.
        </p>
      </div>
    </PageContainer>
  );
}
