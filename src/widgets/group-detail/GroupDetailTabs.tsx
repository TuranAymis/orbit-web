import { cn } from "@/lib/utils";

export type GroupDetailTabId = "about" | "events" | "gallery" | "chat";

const tabs: Array<{ id: GroupDetailTabId; label: string }> = [
  { id: "about", label: "About" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Gallery" },
  { id: "chat", label: "Chat" },
];

interface GroupDetailTabsProps {
  activeTab: GroupDetailTabId;
  onChange: (tab: GroupDetailTabId) => void;
}

export function GroupDetailTabs({
  activeTab,
  onChange,
}: GroupDetailTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Group detail sections"
      className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
