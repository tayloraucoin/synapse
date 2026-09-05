/**
 * ItemRow — the execution row (v2 handoff §5.6).
 *
 * Built new; nothing in CC is a checkbox-led time row. This is the component a
 * person touches most, on a phone, at arm's length, so every decision in it is
 * about that: a 56px checkbox target on the left, a 56px minimum row, no
 * borders, and exactly one word of state.
 *
 * TWO FOCUSABLES, NOT ONE. The checkbox and the row body are separate
 * controls: marking something done and opening it are different intentions,
 * and a single tap target that guesses between them gets it wrong at the worst
 * moment. Same reason as `ListRow`'s trailing slot, and the same structure —
 * siblings, never nested.
 *
 * `item.state` DRIVES EVERY VISUAL. The row derives nothing from times or
 * flags of its own; the view model has already decided. That keeps the row a
 * pure function of the model, so a Storybook story of fifteen states is the
 * whole truth about how it can look.
 *
 * THE CATEGORY EDGE IS 2px AND ABSOLUTE — it must not add to the row's
 * left inset, or rows in different categories would not line up.
 *
 * KEYBOARD (cross-cutting §3.2): Space toggles, Enter opens. Both come free
 * from using a real checkbox and a real button; `s` to start a timer bubbles
 * to the list, which owns the timer.
 */
"use client";

import type { CategoryKey, DayItemView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Checkbox } from "../../../primitives/control/checkbox";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../item-icon";
import { StateWord } from "../state-word";
import { TimeText } from "../time-text";
import { ITEM_ROW_COPY } from "./copy";
import {
  isDoneState,
  isFadedState,
  itemRowVariants,
  stateWordFor,
} from "./item-row.variants";

/** Static so Tailwind emits all eight — see CategoryChip. */
const EDGE: Record<CategoryKey, string> = {
  leaf: "bg-cat-leaf-500",
  sky: "bg-cat-sky-500",
  clay: "bg-cat-clay-500",
  rose: "bg-cat-rose-500",
  amber: "bg-cat-amber-500",
  slate: "bg-cat-slate-500",
  plum: "bg-cat-plum-500",
  moss: "bg-cat-moss-500",
};

export type ItemRowVariant = "default" | "faded-with-action" | "read-only";

export interface ItemRowClasses {
  root?: string;
  check?: string;
  title?: string;
  trailing?: string;
}

export interface ItemRowProps {
  item: DayItemView;
  variant?: ItemRowVariant;
  /** The day's zone, never the viewer's. */
  timeZone: string;
  onToggleDone?: (item: DayItemView) => void;
  onOpen?: (item: DayItemView) => void;
  /** "Bring back" · "Do it anyway" · "Keep instead". */
  action?: { label: string; onClick: (item: DayItemView) => void };
  /** Occupies the state-word slot for five seconds. */
  undo?: { label: string; onUndo: () => void };
  classes?: ItemRowClasses;
  className?: string;
}

export function ItemRow({
  item,
  variant = "default",
  timeZone,
  onToggleDone,
  onOpen,
  action,
  undo,
  classes,
  className,
}: ItemRowProps) {
  const done = isDoneState(item.state);
  const faded = isFadedState(item.state) || variant === "faded-with-action";
  const wordKind = stateWordFor(item.state);
  const showCheckbox = variant === "default" && onToggleDone !== undefined;

  const stateLabel = wordKind === null ? "" : `, ${wordKind}`;
  const categoryLabel =
    item.category === null ? "" : `, ${item.category.name}`;

  const timeText =
    item.state === "active" && item.timerElapsedSec !== null ? (
      <TimeText
        mode="elapsed"
        elapsedSec={item.timerElapsedSec}
        timeZone={timeZone}
        size="secondary"
      />
    ) : item.timeMode === "unscheduled" ? (
      <TimeText mode="anytime" timeZone={timeZone} tone="secondary" />
    ) : item.scheduledEnd !== null && item.scheduledStart !== null ? (
      <TimeText
        mode="window"
        start={item.scheduledStart}
        end={item.scheduledEnd}
        timeZone={timeZone}
        tone={item.state === "done-off-schedule" ? "violet" : "body"}
      />
    ) : item.scheduledStart !== null ? (
      <TimeText
        mode="at"
        start={item.scheduledStart}
        timeZone={timeZone}
        tone={item.state === "done-off-schedule" ? "violet" : "body"}
      />
    ) : null;

  /** A done item with a unit and no value invites the number it is missing. */
  const needsQuantity =
    done && item.quantityUnit !== null && item.quantityValue === null;

  const body = (
    <>
      <ItemIcon icon={item.icon} size={24} />

      <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        <Text
          as="span"
          variant="row-title"
          weight={500}
          truncate
          tone={done ? "body" : "ink"}
          className={classes?.title}
        >
          {item.title}
        </Text>

        <span className="flex flex-wrap items-center gap-(--space-2)">
          {timeText}
          {undo !== undefined ? (
            <StateWord kind="updated" undo={undo} />
          ) : wordKind === null ? null : (
            <StateWord
              kind={wordKind}
              withDot={wordKind === "now" || wordKind === "soon"}
              text={
                wordKind === "from"
                  ? (item.carriedFromLabel ?? undefined)
                  : undefined
              }
            />
          )}
          {needsQuantity ? (
            <StateWord
              kind="add-unit"
              text={ITEM_ROW_COPY.addUnit(item.quantityUnit ?? "")}
            />
          ) : null}
        </span>
      </span>
    </>
  );

  return (
    <li className={cn("relative flex items-center", className)}>
      {item.category === null ? null : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 start-0 w-0.5",
            EDGE[item.category.key],
          )}
        />
      )}

      {showCheckbox ? (
        <span
          className={cn(
            "flex size-14 shrink-0 items-center justify-center",
            faded && "opacity-55",
            classes?.check,
          )}
        >
          <Checkbox
            checked={done}
            aria-label={
              done
                ? ITEM_ROW_COPY.markNotDone(item.title)
                : ITEM_ROW_COPY.markDone(item.title)
            }
            onCheckedChange={() => onToggleDone?.(item)}
            /*
             * 20px visual, 44px target (official spec §9.7, §11). The 56px
             * column around this is layout, not a target — it has no handler,
             * so without the pseudo-element the only tappable area was the
             * 20px box itself, which is the smallest target in the product on
             * the control a person touches most. The transparent `before`
             * belongs to the button, so a press anywhere in it is a press on
             * the checkbox, and at 44px it still leaves 6px clear of the row
             * body on either side. Found on the landing page (SYS-6).
             *
             * Sized by `--target` rather than an inset, so it is exactly the
             * 44px the floor asks for and stays 44px when a person doubles
             * their text size — the column around it grows, the target does
             * not need to.
             */
            className="relative size-5 before:absolute before:top-1/2 before:left-1/2 before:size-(--target) before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
          />
        </span>
      ) : (
        <span className="w-(--space-4) shrink-0" />
      )}

      {onOpen !== undefined && variant !== "read-only" ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={`${item.title}${stateLabel}${categoryLabel}`}
          className={cn(
            itemRowVariants({ interactive: true, faded }),
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
            classes?.root,
          )}
        >
          {body}
        </button>
      ) : (
        <span
          className={cn(
            itemRowVariants({ interactive: false, faded }),
            classes?.root,
          )}
        >
          {body}
        </span>
      )}

      {action === undefined ? null : (
        <span className={cn("shrink-0 pe-(--space-2)", classes?.trailing)}>
          <button
            type="button"
            onClick={() => action.onClick(item)}
            className={cn(
              "text-ink min-h-(--target) px-(--space-2)",
              "text-(length:--fs-secondary) font-medium underline-offset-4 hover:underline",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            {action.label}
          </button>
        </span>
      )}
    </li>
  );
}
