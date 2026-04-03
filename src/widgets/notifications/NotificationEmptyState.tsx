export function NotificationEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center">
      <h3 className="text-base font-semibold text-foreground">All caught up</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        New activity across Orbit will appear here as soon as it happens.
      </p>
    </div>
  );
}
