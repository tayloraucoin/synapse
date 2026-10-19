import type { BlockKind } from "@syn/types";
import { Text, cn } from "@syn/ui";

import { BLOCKS_PRIMER_COPY as COPY } from "./copy";

/**
 * The primer's legend — UX v1.3 §4.2: "a two-column list of nine rows: a
 * 12px hue swatch, the block's word in weight 500, one line of secondary
 * text".
 *
 * A PLAIN LIST, not `ListRow`s — nine one-liners that nobody taps do not
 * want 56px targets (DAY-8, dev's call). Two columns from 360px, one below;
 * beside the axis on desktop it is one column again. Each row reads *word —
 * line*; the swatch is decoration, because the word carries the kind and
 * colour never carries it alone.
 */

/** Whole class names, so Tailwind sees every one. */
const SWATCH: Record<BlockKind, string> = {
  orient: "bg-block-orient",
  morning: "bg-block-morning",
  training: "bg-block-training",
  prep: "bg-block-prep",
  work: "bg-block-work",
  break: "bg-block-break",
  transition: "bg-block-transition",
  activity: "bg-block-activity",
  wind_down: "bg-block-wind-down",
};

export function BlockLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "m-0 grid list-none grid-cols-1 gap-x-(--space-4) gap-y-(--space-2) p-0 min-[360px]:grid-cols-2 wide:grid-cols-1",
        className,
      )}
    >
      {COPY.legend.map((row) => (
        <li key={row.kind} className="flex items-start gap-(--space-2)">
          <span
            aria-hidden="true"
            className={cn("border-hairline mt-1 size-3 shrink-0 border", SWATCH[row.kind])}
          />
          <Text as="span" variant="secondary" tone="secondary">
            <span className="text-ink font-medium">{row.word}</span> — {row.line}
          </Text>
        </li>
      ))}
    </ul>
  );
}
