import type { StoredBlockKind } from "@syn/types";
import { cn } from "@syn/ui";
import type { StripPart } from "@syn/utils";
import { BLOCK_HUE, HUE_DOT } from "./block-hue";

/** A part's fill: Orient ink, open time nothing, Break the muted fill, else the kind's dot. */
function partClass(part: string): string | null {
  if (part === "orient") return "bg-foreground";
  if (part === "open") return null;
  if (part === "break") return "bg-fill-muted";
  const hue = BLOCK_HUE[part as StoredBlockKind];
  return hue ? HUE_DOT[hue] : "bg-fill-muted";
}

export interface DayStripProps {
  parts: readonly StripPart[];
  /** A day with no times (one checklist): an empty dashed strip (copy-picker.md). */
  dashed?: boolean;
}

/**
 * DayStrip (USE-39; USE-45): a day's 8 px strip, segments in kind colours
 * with 2 px gaps, each its share of the day between its bounds. The week's
 * rows and the Copy from picker draw this one strip. Decoration: the row
 * says it in words.
 */
export function DayStrip({ parts, dashed = false }: DayStripProps) {
  if (dashed) {
    return (
      <span
        aria-hidden="true"
        data-strip-dashed=""
        className="block h-2 w-full border border-dashed border-muted-foreground"
      />
    );
  }
  return (
    <span aria-hidden="true" className="flex h-2 w-full gap-0.5">
      {parts.map((part, index) => (
        <span
          key={index}
          data-strip-part={part.part}
          style={{ flexGrow: part.share, flexBasis: 0 }}
          className={cn(
            "min-w-0.5",
            partClass(part.part),
            // Orient's sliver keeps its width at any scale.
            part.part === "orient" && "max-w-1.5 min-w-1.5",
          )}
        />
      ))}
    </span>
  );
}
