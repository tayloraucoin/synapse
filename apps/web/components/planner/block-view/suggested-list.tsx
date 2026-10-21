"use client";

import * as React from "react";
import type { IconValue } from "@syn/types";
import { AddIcon, cn, ItemIcon, Text } from "@syn/ui";
import { HUE_CHIP, type BlockHue } from "../block-hue";
import { BLOCK_VIEW_COPY } from "./copy";

const COPY = BLOCK_VIEW_COPY.suggested;

/**
 * SuggestedList — what a block's kind offers under its add row (USE-156;
 * suggested.md, D-USE-135): "Used before", then "Suggested for <kind>",
 * each a list named by its heading, then "Add one". Each row is the Swap
 * board's library pattern in four fixed lanes: a 36 px icon tile in the
 * kind's chip tint, the name, the length, and a 44 px target holding a
 * 28 px round +. A tap hands the row up; the row leaves once it is in the
 * block, and focus moves to the next +, or to "Add one" when none is left.
 * No toast: the new row is the proof. Props only.
 */
export interface SuggestedListRow {
  key: string;
  title: string;
  icon: IconValue | null;
  lengthMin: number;
}

export interface SuggestedListProps {
  usedBefore: readonly SuggestedListRow[];
  seed: readonly SuggestedListRow[];
  /** "Wellness": the kind's word for "Suggested for <kind>". */
  kind: string;
  hue: BlockHue;
  onAdd: (row: SuggestedListRow) => void;
  /** The add row opened: the existing add path, preset to the block. */
  onAddOne: () => void;
}

export function SuggestedList({
  usedBefore,
  seed,
  kind,
  hue,
  onAdd,
  onAddOne,
}: SuggestedListProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  // The + after the one tapped, found once the tapped row has left.
  const focusAfter = React.useRef<number | null>(null);
  const order = [...usedBefore, ...seed].map((row) => row.key).join(" ");

  React.useEffect(() => {
    const index = focusAfter.current;
    if (index === null) return;
    focusAfter.current = null;
    const pluses =
      rootRef.current?.querySelectorAll<HTMLElement>("[data-suggested-add]") ??
      [];
    const next =
      pluses[Math.min(index, pluses.length - 1)] ??
      rootRef.current?.querySelector<HTMLElement>("[data-suggested-add-one]");
    next?.focus({ preventScroll: true });
  }, [order]);

  function add(row: SuggestedListRow, index: number) {
    focusAfter.current = index;
    onAdd(row);
  }

  const groups = [
    { heading: COPY.usedBefore, rows: usedBefore, from: 0 },
    {
      heading: COPY.suggestedFor(kind),
      rows: seed,
      from: usedBefore.length,
    },
  ].filter((group) => group.rows.length > 0);

  return (
    <div
      ref={rootRef}
      data-suggested-list
      className="flex flex-col gap-(--space-3) pt-(--space-3)"
    >
      {groups.map((group) => (
        <SuggestedGroup
          key={group.heading}
          heading={group.heading}
          rows={group.rows}
          tint={HUE_CHIP[hue]}
          onAdd={(row, index) => add(row, group.from + index)}
        />
      ))}
      <button
        type="button"
        data-suggested-add-one
        onClick={onAddOne}
        className={cn(
          "text-foreground flex min-h-(--target) items-center gap-(--space-3) self-start rounded-(--radius-control)",
          "text-(length:--fs-body) font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <AddIcon aria-hidden="true" className="size-4 shrink-0" />
        {COPY.addOne}
      </button>
    </div>
  );
}

function SuggestedGroup({
  heading,
  rows,
  tint,
  onAdd,
}: {
  heading: string;
  rows: readonly SuggestedListRow[];
  tint: string;
  onAdd: (row: SuggestedListRow, index: number) => void;
}) {
  const id = React.useId();
  return (
    <section className="flex flex-col">
      <Text
        as="h2"
        id={id}
        variant="secondary"
        tone="muted"
        weight={500}
        className="pb-(--space-1)"
      >
        {heading}
      </Text>
      <ul
        aria-labelledby={id}
        className="border-hairline flex flex-col border-t"
      >
        {rows.map((row, index) => {
          const length = BLOCK_VIEW_COPY.length(row.lengthMin);
          return (
            <li
              key={row.key}
              data-suggested-row={row.title}
              className="border-hairline flex min-h-14 items-center gap-(--space-3) border-b"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius)",
                  tint,
                )}
              >
                <ItemIcon icon={row.icon} size={20} />
              </span>
              <Text
                as="span"
                variant="body"
                className="min-w-0 flex-1 truncate"
              >
                {row.title}
              </Text>
              <Text
                as="span"
                variant="secondary"
                tone="muted"
                weight={500}
                className="shrink-0 tabular-nums"
              >
                {length}
              </Text>
              <button
                type="button"
                data-suggested-add
                aria-label={COPY.add(row.title, length)}
                onClick={() => onAdd(row, index)}
                className="group flex size-(--target) shrink-0 items-center justify-center rounded-full outline-none"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "border-ink text-foreground flex size-7 items-center justify-center rounded-full border",
                    "group-hover:bg-surface group-focus-visible:ring-2 group-focus-visible:ring-ring",
                  )}
                >
                  <AddIcon className="size-4" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
