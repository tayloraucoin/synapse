/**
 * BrandGlyph — the mark beside a link (UX v1.3 R53, §10.2, TD-28; DAY-7).
 *
 * Three kinds: `spotify` — the Spotify mark, monochrome, 20px
 * (`SpotifyMark`); `link` — Lucide `Link`, the same 20px at a 1.5px stroke;
 * `play` — Lucide `Play`, the same, for a video to open (a meal topic on
 * YouTube, USE-22), never a video brand's logo.
 * The kind is the link's stored `kind` (`other` → `link`), derived by the
 * service from the host; a caller never picks a brand. A second brand is a
 * new case here, still inline (TD-28's revisit trigger) — never an icon
 * package.
 *
 * `aria-hidden` always: the title beside it is the name.
 */
import * as React from "react";
import { Link as LinkIcon, Play } from "lucide-react";
import { cn } from "../../../lib/cn";
import { SpotifyMark } from "./spotify";

export type BrandGlyphKind = "spotify" | "link" | "play";

export interface BrandGlyphProps {
  kind: BrandGlyphKind;
  className?: string;
}

export function BrandGlyph({ kind, className }: BrandGlyphProps) {
  if (kind === "spotify")
    return <SpotifyMark className={cn("size-5 shrink-0", className)} />;
  if (kind === "play")
    return (
      <Play
        aria-hidden="true"
        strokeWidth={1.5}
        className={cn("size-5 shrink-0", className)}
      />
    );
  return (
    <LinkIcon
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn("size-5 shrink-0", className)}
    />
  );
}
