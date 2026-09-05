/** Sanitize an in-app redirect path (open redirect guard). */
export function sanitizeNextPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  const trimmed = raw?.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }
  return trimmed;
}
