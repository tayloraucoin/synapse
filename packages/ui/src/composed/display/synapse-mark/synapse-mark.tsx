/**
 * SynapseMark — the brand kit's placeholder mark (WEB-1; kit
 * assets/Logos/README.md). A day, the disc, split at the present moment by
 * the rule; the gap is the synapse.
 *
 * Drawn from the kit's `mark.svg` on its 512 grid, with the two clipped
 * circles written as arc paths so no id is needed and the component can
 * render on the server. The inks are the kit's fixed ones, reached through
 * `--logo-disc` and `--logo-rule` in `preset.css`: an ink disc and a
 * brand-500 rule in light, a paper disc and a brand-400 rule in dark. Never
 * recolour the rule and never place it on a `surface` tint.
 *
 * A placeholder, not a designed logo: replace it before launch (open brand
 * item in docs/ux/branding-guide.md). `aria-hidden` by default, because the
 * name "Synapse" is printed beside it; pass `label` where it stands alone.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export interface SynapseMarkProps {
  className?: string;
  /** An accessible name, when the mark appears without the word beside it. */
  label?: string;
}

export function SynapseMark({ className, label }: SynapseMarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("size-5 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d="M63.43 310A200 200 0 1 1 448.57 310Z" fill="var(--logo-disc)" />
      <path d="M77.39 346A200 200 0 0 0 434.61 346Z" fill="var(--logo-disc)" />
      <rect x="24" y="320" width="464" height="16" fill="var(--logo-rule)" />
    </svg>
  );
}
