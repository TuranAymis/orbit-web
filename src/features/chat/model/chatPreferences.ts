export interface ChatPreferences {
  lastReadAtByChannel: Record<string, string>;
}

const CHAT_PREFERENCES_STORAGE_KEY = "orbit:chat:preferences";

const defaultChatPreferences: ChatPreferences = {
  lastReadAtByChannel: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeChatPreferences(payload: unknown): ChatPreferences {
  if (!isRecord(payload)) {
    return defaultChatPreferences;
  }

  const lastReadAtByChannel = isRecord(payload.lastReadAtByChannel)
    ? Object.fromEntries(
        Object.entries(payload.lastReadAtByChannel).filter(
          (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string",
        ),
      )
    : {};

  return {
    lastReadAtByChannel,
  };
}

export function readChatPreferences(): ChatPreferences {
  if (typeof window === "undefined") {
    return defaultChatPreferences;
  }

  const storedValue = window.localStorage.getItem(CHAT_PREFERENCES_STORAGE_KEY);
  if (!storedValue) {
    return defaultChatPreferences;
  }

  try {
    return normalizeChatPreferences(JSON.parse(storedValue));
  } catch {
    return defaultChatPreferences;
  }
}

export function writeChatPreferences(preferences: ChatPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    CHAT_PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
}

export function updateChatPreferences(
  updater: (currentPreferences: ChatPreferences) => ChatPreferences,
) {
  const nextPreferences = updater(readChatPreferences());
  writeChatPreferences(nextPreferences);
  return nextPreferences;
}

export { defaultChatPreferences };
