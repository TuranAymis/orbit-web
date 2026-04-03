interface NotificationBadgeProps {
  count: number;
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      aria-label={`${count} unread notifications`}
      className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-primary/30 bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
