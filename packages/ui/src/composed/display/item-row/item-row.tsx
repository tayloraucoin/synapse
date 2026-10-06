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
import { ItemIcon, PinGlyph } from "../item-icon";
import { StateWord } from "../state-word";
import { TimeText } from "../time-text";
import { ITEM_ROW_COPY } from "./copy";
import {
  isDoneState,
  isFadedState,
  isUntickableState,
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

/**
 * `container` — UX v1.1 §6.1: the work block as one row, the focus as its
 * title, its span as its time text, the fixtures nested beneath, no checkbox.
 */
export type ItemRowVariant =
  | "default"
  | "faded-with-action"
  | "read-only"
  | "container";

export interface ItemRowClasses {
  root?: string;
  check?: string;
  title?: string;
  trailing?: string;
  /** The nested rows under a container. */
  children?: string;
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
  /**
   * The anchor glyph before the title (UX v1.1 §6.1, §10.1). Read from
   * `item.pinned` when omitted; a prop so a caller can show a pin on a row
   * whose model predates the column.
   */
  pinned?: boolean;
  /**
   * The devices-off marker (UX v1.1 §7.1): a hairline row with the glyph and
   * the time, no checkbox — "a marker, not a task". The caller says which row
   * is the marker; the row does not guess from the model.
   */
  marker?: boolean;
  /** A container's nested rows (its fixtures), at one indent step. */
  children?: React.ReactNode;
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
  pinned,
  marker = false,
  children,
  classes,
  className,
}: ItemRowProps) {
  const done = isDoneState(item.state);
  const faded = isFadedState(item.state) || variant === "faded-with-action";
  const wordKind = stateWordFor(item.state);
  const isPinned = pinned ?? item.pinned;
  const container = variant === "container";
  const showCheckbox =
    variant === "default" &&
    onToggleDone !== undefined &&
    !marker &&
    !isUntickableState(item.state);

  const stateLabel =
    item.state === "not-confirmed"
      ? `, ${ITEM_ROW_COPY.notConfirmed}`
      : wordKind === null
        ? ""
        : `, ${wordKind}`;
  const categoryLabel =
    item.category === null ? "" : `, ${item.category.name}`;
  const pinnedLabel = isPinned ? `, ${ITEM_ROW_COPY.pinned}` : "";
  const containerLabel = container ? `, ${ITEM_ROW_COPY.container}` : "";

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

  /*
   * The devices-off marker (§7.1): "a hairline row with the anchor glyph and
   * the time, no checkbox." Not a task — nothing to tick, nothing to open.
   */
  if (marker) {
    return (
      <li
        data-item-row
        data-item-id={item.id}
        data-marker
        aria-label={`${item.title}${pinnedLabel}`}
        className={cn(
          "flex min-h-(--space-6) items-center gap-(--space-2) ps-(--space-4) pe-(--space-4)",
          className,
        )}
      >
        <span aria-hidden="true" className="border-hairline flex-1 border-t" />
        <span className="text-text-secondary flex items-center gap-(--space-1)">
          <PinGlyph size={12} />
          <Text as="span" variant="caption" tone="secondary">
            {item.title}
          </Text>
          {item.scheduledStart === null ? null : (
            <TimeText mode="at" start={item.scheduledStart} timeZone={timeZone} tone="secondary" size="secondary" />
          )}
        </span>
        <span aria-hidden="true" className="border-hairline flex-1 border-t" />
      </li>
    );
  }

  const body = (
    <>
      <ItemIcon icon={item.icon} size={24} />

      <span className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
        <span className="flex min-w-0 items-center gap-(--space-1)">
          {isPinned ? <PinGlyph size={12} className="text-text-secondary" /> : null}
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
        </span>

        <span className="flex flex-wrap items-center gap-(--space-2)">
          {timeText}
          {undo !== undefined ? (
            <StateWord kind="updated" undo={undo} />
          ) : item.state === "not-confirmed" ? (
            <Text as="span" variant="caption" tone="secondary" weight={500}>
              {ITEM_ROW_COPY.notConfirmed}
            </Text>
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
    /*
     * `data-item-row` is SYS-4's handle: the roving-focus hook finds rows by it
     * and moves `tabIndex` between them. It is a data attribute rather than a
     * class so restyling can never break keyboard navigation.
     */
    <li
      data-item-row
      // SYS-4's `s` needs to know WHICH item; the List holds the mutations.
      data-item-id={item.id}
      data-container={container ? "true" : undefined}
      data-pinned={isPinned ? "true" : undefined}
      className={cn(
        "relative flex items-center",
        // Only a container wraps: its nested list takes the next line.
        container && "flex-wrap",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {item.category === null ? null : (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 start-0 w-0.5",
            EDGE[item.category.key],
          )}
        />
      )}

      {container ? (
        // A container has no checkbox and never will (§10.1: never scored).
        <span className="w-(--space-4) shrink-0" />
      ) : showCheckbox ? (
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
          // SYS-4's `Enter` presses this; the handler stays in one place.
          data-row-open
          onClick={() => onOpen(item)}
          aria-label={`${item.title}${containerLabel}${pinnedLabel}${stateLabel}${categoryLabel}`}
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

      {/*
       * A container's fixtures, "nested beneath with a shallow indent" (§6.1).
       * One indent step; the nested rows are full `ItemRow`s with their own
       * handles, so roving focus walks into them in order.
       */}
      {container && children !== undefined ? (
        <ul className={cn("flex w-full flex-col ps-(--space-6)", classes?.children)}>
          {children}
        </ul>
      ) : null}
    </li>
  );
}
