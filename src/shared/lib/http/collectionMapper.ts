/** Backend lists are arrays today; older and paginated responses can wrap them. */
export function mapCollection<T>(payload: unknown, aliases: readonly string[] = []): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  for (const key of ["items", ...aliases]) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
}
