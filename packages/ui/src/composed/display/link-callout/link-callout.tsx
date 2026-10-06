/**
 * LinkCallout — a thing to open, on the orient frame (UX v1.3 R53, §3.17,
 * §5.2, §10.2, §10.4, TD-28; DAY-7).
 *
 * A callout under the reading: the `BrandGlyph` left, the title (row-title,
 * 500) over the host (caption, secondary), Lucide `ExternalLink` right —
 * `bg-surface`, a hairline, 56px at least. A tap opens the thing in a new tab
 * (`target="_blank" rel="noopener noreferrer"`); on a phone the Spotify app
 * intercepts its own links.
 *
 * IT FETCHES NOTHING. No preview, no favicon, no title lookup — the URL is
 * the `href` and nothing else touches it. The URL is never shown as text:
 * the caller passes `host` (it has the URL), so a long link never breaks the
 * row; an empty host shows the title alone.
 *
 * Hover darkens the surface one neutral step (`fill-muted`: neutral-200 /
 * neutral-700); reduced motion drops the transition. The name is *{title},
 * opens in a new tab*; both glyphs are `aria-hidden`.
 */
import { ExternalLink } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { BrandGlyph } from "../brand-glyph";
import { LINK_CALLOUT_COPY } from "./copy";

export interface LinkCalloutProps {
  title: string;
  /** The link, opened as is; https or the Spotify app's own (stored normalised to https). */
  url: string;
  /** *open.spotify.com* — the caller's `new URL(url).host`; empty shows the title alone. */
  host: string;
  /** The stored kind: `spotify` draws the mark; anything else the link glyph. */
  kind: "spotify" | "other";
  className?: string;
}

export function LinkCallout({ title, url, host, kind, className }: LinkCalloutProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-link-callout
      className={cn(
        "bg-surface border-hairline text-ink flex min-h-14 items-center gap-(--space-3) rounded-(--radius) border px-(--space-3) py-(--space-2)",
        "hover:bg-fill-muted motion-safe:transition-colors motion-safe:duration-(--dur-state)",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <BrandGlyph kind={kind === "spotify" ? "spotify" : "link"} />
      <span className="flex min-w-0 flex-1 flex-col">
        <Text as="span" variant="row-title" weight={500} truncate>
          {title}
        </Text>
        {host === "" ? null : (
          <Text as="span" variant="caption" tone="secondary" truncate>
            {host}
          </Text>
        )}
        <span className="sr-only">, {LINK_CALLOUT_COPY.opensInANewTab}</span>
      </span>
      <ExternalLink aria-hidden="true" strokeWidth={1.5} className="text-text-secondary size-5 shrink-0" />
    </a>
  );
}
