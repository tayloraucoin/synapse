"use client";

import * as React from "react";
import {
  Button,
  cn,
  CollapseIcon,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ExpandIcon,
  Text,
} from "@syn/ui";
import { BLOCK_HUE, HUE_DOT } from "@/components/planner/block-hue";
import { DAY_COLUMN_GUTTER_PX } from "@/components/planner/day-column";
import { spanLabel } from "@/components/planner/day-column/copy";
import type { ReviewPassedBlock } from "@/lib/data/use-review-day";
import { REVIEW_LATE_COPY as COPY } from "./late-copy";

/**
 * The passed row (USE-38; late.md, late-passed-open.md): on a late wake,
 * every block that ended by Orient's end folds into one row under the tray,
 * "Planned before 8:10 · Wellness", indented to the column. It opens, as a
 * disclosure, to one card per passed block: the name over its planned span,
 * a 3 px edge in the kind's dot colour (the name says the kind, so colour is
 * never alone), Move later and Leave. The column below moves down by it.
 *
 * Nothing here is grey, red or worded late: a passed block is words.
 *
 * Leave writes nothing. The card goes for this visit and the row keeps its
 * name; the block stays folded and is not run. With every card left the row
 * folds closed. Move later is the frame's: it writes today only, with Undo.
 */
export interface PassedRowProps {
  /** The wake, "HH:MM". */
  wokeAt: string;
  passed: readonly ReviewPassedBlock[];
  onMoveLater: (blockId: string) => void;
  /** A later start again, past its once-a-day flag (USE-41). */
  onLaterStart?: () => void;
  /** A scenario's capture opens it on load. */
  defaultOpen?: boolean;
}

/**
 * Leave, on the row's own state only: the card goes and the row keeps its
 * name; with every card left the row folds. Nothing is written.
 */
export function leaveCard(
  {
    left,
    passed,
  }: { left: ReadonlySet<string>; passed: readonly ReviewPassedBlock[] },
  blockId: string,
): { left: ReadonlySet<string>; open: boolean } {
  const next = new Set(left).add(blockId);
  return { left: next, open: passed.some((block) => !next.has(block.id)) };
}

export function PassedRow({
  wokeAt,
  passed,
  onMoveLater,
  onLaterStart,
  defaultOpen = false,
}: PassedRowProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [left, setLeft] = React.useState<ReadonlySet<string>>(new Set());
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const cards = passed.filter((block) => !left.has(block.id));
  const Chevron = open ? CollapseIcon : ExpandIcon;
  const indent = { paddingInlineStart: `${DAY_COLUMN_GUTTER_PX}px` };

  function leave(blockId: string) {
    const next = leaveCard({ left, passed }, blockId);
    setLeft(next.left);
    if (!next.open) setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-hairline border-b"
    >
      <CollapsibleTrigger
        ref={triggerRef}
        className={cn(
          "flex min-h-(--target) w-full cursor-pointer items-center gap-(--space-2) px-(--space-4) text-start",
          "hover:bg-surface transition-colors duration-(--dur-state) ease-(--ease-settle)",
        )}
      >
        <span className="flex min-w-0 flex-1" style={indent}>
          <Text as="span" variant="secondary" tone="muted" truncate>
            {COPY.passed(
              wokeAt,
              passed.map((block) => block.name),
            )}
          </Text>
        </span>
        <Chevron
          aria-hidden="true"
          className="text-text-muted size-4 shrink-0"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-(--space-4) pb-(--space-3)">
          <ul className="flex flex-col gap-(--space-2)" style={indent}>
            {cards.map((block) => (
              <li
                key={block.id}
                className="bg-surface flex overflow-hidden rounded-(--radius-control)"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-0.75 shrink-0",
                    HUE_DOT[BLOCK_HUE[block.kind]],
                  )}
                />
                <div className="flex min-w-0 flex-1 items-center gap-(--space-2) py-(--space-2) ps-(--space-3) pe-(--space-2)">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Text as="span" weight={600} truncate>
                      {block.name}
                    </Text>
                    <Text as="span" variant="secondary" tone="muted">
                      {spanLabel(block.startsAt, block.endsAt)}
                    </Text>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-background"
                    aria-label={COPY.moveLaterLabel(block.name)}
                    onClick={() => onMoveLater(block.id)}
                  >
                    {COPY.moveLater}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-muted"
                    aria-label={COPY.leaveLabel(block.name)}
                    onClick={() => leave(block.id)}
                  >
                    {COPY.leave}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {onLaterStart ? (
            <div style={indent}>
              <Button
                variant="ghost"
                size="sm"
                className="text-link -ms-(--space-3) mt-(--space-1)"
                onClick={onLaterStart}
              >
                {COPY.laterStart} ›
              </Button>
            </div>
          ) : null}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
