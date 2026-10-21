/**
 * SynapseMark — mark A, the day split refined (chosen 2026-10-20; the Paper
 * "Logo" page, frame "A — Refined: lockup system (chosen)", and
 * specs/web/explorations/logo/findings.md). A day, the disc, split just past
 * its middle by the rule: the app's own now line. The gap is the synapse.
 *
 * Master on a 512 grid, unit 16: disc r192 centred, gap y280–328, and a 16
 * rule (y296–312) whose ends follow the disc's curve, so the silhouette is a
 * whole circle with two slits. Below 32px pass `small`: the small master drops
 * the rule and widens the gap to y272–336, because the rule and its air fall
 * under a pixel there. The viewBox is the disc's own bounds, so the element's
 * size is the disc's diameter (lockup: D = 1.4 × cap height, D/2 to the "S").
 *
 * The inks are fixed and reached through `--logo-disc` and `--logo-rule` in
 * `preset.css`: an ink disc and a brand-500 rule in light, a paper disc and a
 * brand-400 rule in dark. Never recolour or tilt the rule, and never place
 * the mark on a `surface` tint.
 *
 * PLACEHOLDER: drafted, not tested with people. Fame, uniqueness and
 * recognition after one look are untested (findings.md). `aria-hidden` by
 * default, because the name "Synapse" is printed beside it; pass `label`
 * where it stands alone.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export interface SynapseMarkProps {
  className?: string;
  /** An accessible name, when the mark appears without the word beside it. */
  label?: string;
  /** The small master, for a disc under 32px: no rule, a wider gap. */
  small?: boolean;
}

export function SynapseMark({ className, label, small }: SynapseMarkProps) {
  return (
    <svg
      viewBox="64 64 384 384"
      className={cn("size-5 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {small ? (
        <>
          <path
            d="M64.67 272A192 192 0 1 1 447.33 272Z"
            fill="var(--logo-disc)"
          />
          <path
            d="M81.46 336A192 192 0 0 0 430.54 336Z"
            fill="var(--logo-disc)"
          />
        </>
      ) : (
        <>
          <path
            d="M65.51 280A192 192 0 1 1 446.49 280Z"
            fill="var(--logo-disc)"
          />
          <path
            d="M78.01 328A192 192 0 0 0 433.99 328Z"
            fill="var(--logo-disc)"
          />
          <path
            d="M68.21 296H443.79A192 192 0 0 1 439.65 312H72.35A192 192 0 0 1 68.21 296Z"
            fill="var(--logo-rule)"
          />
        </>
      )}
    </svg>
  );
}
