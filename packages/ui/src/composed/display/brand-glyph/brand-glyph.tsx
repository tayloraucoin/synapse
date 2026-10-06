/**
 * BrandGlyph — the mark beside a link (UX v1.3 R53, §10.2, TD-28; DAY-7).
 *
 * Two kinds, and only two: `spotify` — the Spotify mark, monochrome, 20px
 * (`SpotifyMark`); `link` — Lucide `Link`, the same 20px at a 1.5px stroke.
 * The kind is the link's stored `kind` (`other` → `link`), derived by the
 * service from the host; a caller never picks a brand. A second brand is a
 * new case here, still inline (TD-28's revisit trigger) — never an icon
 * package.
 *
 * `aria-hidden` always: the title beside it is the name.
 */
import { Link as LinkIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { SpotifyMark } from "./spotify";

export type BrandGlyphKind = "spotify" | "link";

export interface BrandGlyphProps {
  kind: BrandGlyphKind;
  className?: string;
}

export function BrandGlyph({ kind, className }: BrandGlyphProps) {
  if (kind === "spotify") return <SpotifyMark className={cn("size-5 shrink-0", className)} />;
  return <LinkIcon aria-hidden="true" strokeWidth={1.5} className={cn("size-5 shrink-0", className)} />;
}
