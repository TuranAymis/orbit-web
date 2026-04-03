import type { Member } from "@/entities/message/model/types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberListProps {
  members: Member[];
}

const statusDotClasses: Record<Member["status"], string> = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  offline: "bg-slate-500",
};

export function MemberList({ members }: MemberListProps) {
  const onlineMembers = members.filter((member) => member.status !== "offline");
  const offlineMembers = members.filter((member) => member.status === "offline");

  const sections = [
    { title: "Online now", members: onlineMembers },
    { title: "Offline", members: offlineMembers },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        Members
      </h2>
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {section.title}
          </h3>
          <div className="mt-3 space-y-3">
            {section.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{member.avatarFallback}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#11131f]",
                      statusDotClasses[member.status],
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.role ?? member.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
