import type { Message } from "@/entities/message/model/types";
import type { AuthSession } from "@/features/auth/types";

interface MentionIdentity {
  id?: string | null;
  name?: string | null;
  email?: string | null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenizeIdentity(value: string | undefined | null) {
  if (!value) {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
  const compact = trimmed.toLowerCase().replace(/\s+/g, "");

  return Array.from(new Set([trimmed.toLowerCase(), slug, compact]));
}

export function getMentionTokens(session?: AuthSession | null) {
  return getMentionTokensForIdentity(session?.user);
}

export function getMentionTokensForIdentity(identity?: MentionIdentity | null) {
  return Array.from(
    new Set([
      ...tokenizeIdentity(identity?.name),
      ...tokenizeIdentity(identity?.email?.split("@")[0]),
      ...tokenizeIdentity(identity?.id),
    ]),
  );
}

export function messageMentionsCurrentUser(
  content: string,
  session?: AuthSession | null,
) {
  return messageMentionsIdentity(content, session?.user);
}

export function messageMentionsIdentity(
  content: string,
  identity?: MentionIdentity | null,
) {
  const normalizedContent = content.toLowerCase();

  return getMentionTokensForIdentity(identity).some((token) =>
    new RegExp(`(^|\\s)@${escapeRegExp(token)}(?=\\s|$|[.,!?])`, "i").test(normalizedContent),
  );
}

export function withMentionState(
  message: Message,
  session?: AuthSession | null,
) {
  return withMentionStateForIdentity(message, session?.user);
}

export function withMentionStateForIdentity(
  message: Message,
  identity?: MentionIdentity | null,
) {
  return {
    ...message,
    isMention: messageMentionsIdentity(message.content, identity),
  };
}
