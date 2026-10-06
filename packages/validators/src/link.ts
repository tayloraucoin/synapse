import { z } from "zod";

import { LINK_TITLE_MAX, LINK_URL_MAX, SPOTIFY_LINK_SCHEME } from "@syn/constants";

/**
 * A link — UX v1.3 R53, §3.17, §11.4, TD-28. The `LinkSheet` and
 * `link.save` share this.
 *
 * A title and a URL; NO KIND. The kind is derived from the host by the
 * service (`deriveLinkKind` in `@syn/utils`) and stored — a person never
 * chooses it. The URL is `https:` or the Spotify app's own `spotify:`
 * scheme; plain `http:`, `javascript:` and anything else are refused, so
 * the frame only ever opens a link that is safe to hand the browser. Nothing
 * is fetched.
 */

// [COPY] v1.3 §4.4 B8, §13 #40 — the invalid-link line, for Taylor's read.
const INVALID_URL = "That link doesn't look right.";

const isOpenable = (value: string): boolean => {
  if (value.toLowerCase().startsWith(SPOTIFY_LINK_SCHEME)) {
    return value.length > SPOTIFY_LINK_SCHEME.length;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "";
  } catch {
    return false;
  }
};

export const linkFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    // [COPY — needs Vesper sign-off: v1.3 gives no line for an empty title; the fixture sheet's is reused.]
    .min(1, "Give it a title.")
    .max(LINK_TITLE_MAX, "Give it a title."),
  url: z
    .string()
    .trim()
    .min(1, INVALID_URL)
    .max(LINK_URL_MAX, INVALID_URL)
    .refine(isOpenable, INVALID_URL),
});

export type LinkFormInput = z.infer<typeof linkFormSchema>;

export const linkIdInput = z.object({ id: z.string().uuid() });

export const listLinksInput = z
  .object({ includeArchived: z.boolean().optional() })
  .optional();

/** The full ordered id list; the service refuses one that omits an active row (as passages). */
export const reorderLinksInput = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
