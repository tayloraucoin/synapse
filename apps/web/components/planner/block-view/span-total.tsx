import { cn, Text } from "@syn/ui";
import { HUE_DOT, type BlockHue } from "../block-hue";
import { BLOCK_VIEW_COPY } from "./copy";

const COPY = BLOCK_VIEW_COPY.suggested;

/**
 * SpanTotal — the running total under an editing block's header (USE-156;
 * suggested.md, D-USE-137): "<n> of <span> min" on the left, "<m> min free"
 * on the right, over a 4 px track filled in the kind's colour as far as the
 * items reach. Empty, it reads "Nothing in <block> yet". Past the span the
 * track fills in ink and the right reads "Runs <n> min past <end>", in ink:
 * information, never red, and never colour alone. A `meter` named
 * "<block> planned", its value text the words shown. Props only.
 */
export interface SpanTotalProps {
  /** The block's name: "Wellness". */
  block: string;
  plannedMin: number;
  spanMin: number;
  freeMin: number;
  overMin: number;
  /** "8:05": the block's end, as the rail reads it. */
  end: string;
  hue: BlockHue;
}

export function SpanTotal({
  block,
  plannedMin,
  spanMin,
  freeMin,
  overMin,
  end,
  hue,
}: SpanTotalProps) {
  const over = overMin > 0;
  const lead =
    plannedMin === 0
      ? COPY.nothingIn(block)
      : COPY.planned(plannedMin, spanMin);
  const trail = over ? COPY.runsPast(overMin, end) : COPY.free(freeMin);
  const percent =
    spanMin <= 0 ? 0 : Math.min(100, Math.round((plannedMin / spanMin) * 100));

  return (
    <div
      role="meter"
      aria-label={COPY.meter(block)}
      aria-valuemin={0}
      aria-valuemax={spanMin}
      aria-valuenow={Math.min(plannedMin, spanMin)}
      aria-valuetext={`${lead}, ${trail}`}
      data-span-total={over ? "over" : "within"}
      className="flex flex-col gap-(--space-1) ps-(--space-4)"
    >
      <div className="flex items-baseline justify-between gap-(--space-3)">
        <Text
          as="span"
          variant="secondary"
          weight={600}
          className="tabular-nums"
        >
          {lead}
        </Text>
        <Text
          as="span"
          variant="secondary"
          tone={over ? "ink" : "muted"}
          weight={over ? 600 : 500}
          className="text-end tabular-nums"
        >
          {trail}
        </Text>
      </div>
      <div
        aria-hidden="true"
        className="bg-fill-muted h-1 overflow-hidden rounded-full"
      >
        <div
          className={cn("h-full rounded-full", over ? "bg-ink" : HUE_DOT[hue])}
          style={{ width: `${over ? 100 : percent}%` }}
        />
      </div>
    </div>
  );
}
