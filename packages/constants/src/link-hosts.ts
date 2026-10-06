/**
 * The hosts a link's kind is derived from — UX v1.3 R53, §3.17, §12.4,
 * TD-28.
 *
 * A link is a title and a URL; its kind is never chosen. `deriveLinkKind` in
 * `@syn/utils` reads these: `spotify` for the two hosts and the `spotify:`
 * scheme (the app on a phone intercepts its own links), `other` for anything
 * else. Nothing is fetched — the kind only decides the glyph beside the
 * callout.
 */

export const LINK_KINDS = ["spotify", "other"] as const;

export type LinkKindValue = (typeof LINK_KINDS)[number];

/** Hosts whose links are Spotify's, matched exactly (no subdomain wildcard). */
export const SPOTIFY_LINK_HOSTS = ["open.spotify.com", "spotify.link"] as const;

/** The URI scheme the Spotify app registers — `spotify:playlist:…`. */
export const SPOTIFY_LINK_SCHEME = "spotify:";
