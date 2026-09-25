import { SPOTIFY_LINK_HOSTS, SPOTIFY_LINK_SCHEME, type LinkKindValue } from "@syn/constants";

/**
 * A link's kind, from its URL — UX v1.3 R53, §3.17, TD-28.
 *
 * DERIVED, NEVER CHOSEN. `spotify` for `open.spotify.com` and `spotify.link`
 * (exact hosts) and the `spotify:` scheme; `other` for anything else,
 * including a string that does not parse. The service calls this on every
 * save and stores the answer, so the orient frame never parses a URL.
 *
 * Pure: no fetch, no DNS — the link is opened by the person, never read by
 * the app.
 */
export function deriveLinkKind(url: string): LinkKindValue {
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith(SPOTIFY_LINK_SCHEME)) return "spotify";
  let host: string;
  try {
    host = new URL(trimmed).hostname.toLowerCase();
  } catch {
    return "other";
  }
  return (SPOTIFY_LINK_HOSTS as readonly string[]).includes(host) ? "spotify" : "other";
}
