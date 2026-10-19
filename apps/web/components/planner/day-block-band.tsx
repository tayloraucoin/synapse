import type { StoredBlockKind } from "@syn/types";
import { cn, Text } from "@syn/ui";
import { BLOCK_HUE, HUE_CHIP, HUE_DOT } from "./block-hue";

/**
 * DayBlockBand — the current block as a band at the desk (USE-10; Today's
 * index, layout 2): the kind's colour as a wash with its edge, the name, then
 * the span and what is in it ("9:30 to 12:00 · Kestrel weekly at 11:00, in
 * 40 min"). The name is always printed beside the colour.
 *
 * Named apart from `@syn/ui`'s legacy `BlockBand`, the Schedule's positioned
 * band, which this is not.
 */
export interface DayBlockBandProps {
  kind: StoredBlockKind;
  /** "Work" */
  name: string;
  /** "9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min" */
  detail: string;
  className?: string;
}

export function DayBlockBand({
  kind,
  name,
  detail,
  className,
}: DayBlockBandProps) {
  const hue = BLOCK_HUE[kind];
  return (
    <div
      data-day-block-band={kind}
      className={cn(
        "flex min-h-9 items-center gap-(--space-3) overflow-hidden rounded-(--radius-control) pe-(--space-3)",
        HUE_CHIP[hue],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("w-0.5 self-stretch", HUE_DOT[hue])}
      />
      <Text
        as="span"
        variant="secondary"
        weight={600}
        className="ps-(--space-1)"
      >
        {name}
      </Text>
      <Text
        as="span"
        variant="secondary"
        className="min-w-0 truncate tabular-nums"
      >
        {detail}
      </Text>
    </div>
  );
}
