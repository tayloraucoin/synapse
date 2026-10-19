"use client";

import { cn, HueSquare, SessionIcon, Text } from "@syn/ui";
import { BLOCK_HUE, HUE_DOT } from "@/components/planner/block-hue";
import type { WorkParts } from "@/lib/data/this-week-day";
import { TIER_HUE } from "../view";

/**
 * WorkTiersInPlace (USE-81; work/this-week/states/the-day.md, D-USE-107):
 * inside This week's Work block in Set my days' day column, the block open to
 * its tiers. Each tier its 7 px square and word (Stretch slate, D-USE-79);
 * rows with the emoji first and, at the right, the link glyph and "2 of 3"
 * or the day's due words, as captions, never a badge; an empty tier's
 * "+ Add to <tier>"; a sky rule, then the fit line in ink, medium, never
 * red, never a count. Rows open the Item sheet; the add row opens the
 * block's Block view, where the tier's add menu lives [ASSUMPTION]. The row
 * just placed is marked once by a background band (placed-undo.md). A past
 * day's rows are muted and its fit line is gone (past-day.md).
 *
 * The block card it sits in passes pointer events to buttons only, so every
 * control here is a button.
 */

export interface WorkTiersInPlaceProps {
  parts: WorkParts;
  past?: boolean;
  /** The item just placed: its row marked once. */
  marked?: string | null;
  onRow: (workItemId: string) => void;
  onAdd: () => void;
}

const SKY = HUE_DOT[BLOCK_HUE.work];

export function WorkTiersInPlace({
  parts,
  past = false,
  marked = null,
  onRow,
  onAdd,
}: WorkTiersInPlaceProps) {
  return (
    <div data-work-parts className="flex flex-col gap-(--space-1)">
      {parts.tiers.map((tier) => (
        <div key={tier.tier} className="flex flex-col">
          <Text
            as="span"
            variant="caption"
            tone="muted"
            className="flex h-5 items-center gap-(--space-1)"
          >
            <HueSquare hue={TIER_HUE[tier.tier]} />
            {tier.word}
          </Text>
          {tier.rows.map((row) => (
            <button
              key={row.slotId}
              type="button"
              aria-label={row.label}
              data-marked={row.workItemId === marked ? "placed" : undefined}
              onClick={() => onRow(row.workItemId)}
              className={cn(
                "-mx-(--space-1) flex min-h-7 items-center gap-(--space-2) rounded-(--radius-sm) px-(--space-1) text-start outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                row.workItemId === marked && "bg-background",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "min-w-0 flex-1 truncate text-(length:--fs-body)",
                  past || row.done
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {row.emoji ? `${row.emoji} ` : null}
                {row.title}
              </span>
              {row.trail ? (
                <span
                  aria-hidden="true"
                  className="flex shrink-0 items-center gap-1 text-(length:--fs-caption) text-muted-foreground"
                >
                  {row.trail.kind === "session" ? (
                    <SessionIcon className="size-3" />
                  ) : null}
                  {row.trail.words}
                </span>
              ) : null}
            </button>
          ))}
          {tier.add ? (
            <button
              type="button"
              onClick={onAdd}
              className={cn(
                "-mx-(--space-1) flex min-h-7 items-center rounded-(--radius-sm) px-(--space-1) text-start text-(length:--fs-secondary) text-muted-foreground outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
              )}
            >
              {tier.add}
            </button>
          ) : null}
        </div>
      ))}
      {parts.fitLine ? (
        <>
          <span aria-hidden="true" className={cn("mt-(--space-1) h-px", SKY)} />
          <Text
            as="p"
            className="text-(length:--fs-label) font-medium text-foreground"
          >
            {parts.fitLine}
          </Text>
        </>
      ) : null}
    </div>
  );
}
