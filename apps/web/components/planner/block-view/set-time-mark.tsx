import { SetTimeIcon } from "@syn/ui";
import { BLOCK_VIEW_COPY as COPY } from "./copy";
import { clockLabel } from "./geometry";

/**
 * SetTimeMark — a set-time row's trailing edge in editing (USE-49; round 8,
 * wellness-editing.md): "At 7:10 · 10 min", then a clock in the grip's
 * place. The row is pinned at its time, so it has no grip and never moves
 * on reorder; the clock is a mark, named "Set at 7:10" [PROPOSED]. Props only.
 */
export interface SetTimeMarkProps {
  /** "HH:MM". */
  atTime: string;
  /** "10 min", or null with no length. */
  length: string | null;
}

export function SetTimeMark({ atTime, length }: SetTimeMarkProps) {
  const time = clockLabel(atTime);
  return (
    <>
      <span className="text-text-muted shrink-0 text-(length:--fs-caption) leading-(--lh-caption) tabular-nums">
        {COPY.editing.at(time, length)}
      </span>
      <span
        role="img"
        aria-label={COPY.editing.setAt(time)}
        data-set-time
        className="flex size-(--target) shrink-0 items-center justify-center"
      >
        <SetTimeIcon aria-hidden="true" className="text-foreground size-4" />
      </span>
    </>
  );
}
