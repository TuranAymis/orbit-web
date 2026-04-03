interface ChatEmptyStateProps {
  channelName: string;
}

export function ChatEmptyState({ channelName }: ChatEmptyStateProps) {
  const displayName = channelName.replace(/-/g, " ");

  return (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 text-center">
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-foreground">No messages yet</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start the conversation in {displayName} and your first message will appear
          here.
        </p>
      </div>
    </div>
  );
}
