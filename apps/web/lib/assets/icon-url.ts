import type { IconValue } from "@syn/types";

import { assetRoute } from "@/lib/routes";

/**
 * Turn a stored `IconValue` into something an `<img src>` can use.
 *
 * `@syn/ui` never does this itself (v2 handoff §3.5: the `image` arm "carries
 * the storage path; the URL is resolved by the caller"). `ItemIcon` takes an
 * `imageUrl`, `Avatar` takes a `src`, and this is the one function that
 * computes either — so the day the read rail changes shape, it changes here.
 *
 * Emoji and curated icons have no URL: they are a character and a glyph the
 * component already knows how to draw. Null is the honest answer, not a
 * placeholder image.
 */
export function iconImageUrl(icon: IconValue | null | undefined): string | null {
  if (!icon || icon.kind !== "image") return null;
  return assetRoute(icon.value);
}

/** The account photo's path, from `user.avatar`. */
export function avatarImageUrl(
  storagePath: string | null | undefined,
): string | null {
  if (!storagePath) return null;
  return assetRoute(storagePath);
}
