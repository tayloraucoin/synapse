/**
 * TaskRow — one task on the board (Workflow UX v0.1 §3.2–§3.4, WF-01, §9).
 *
 * VIEW MODEL IN, INTENTS OUT. It takes a `WorkflowTaskView` and the caller's
 * `now`, and reports `onOpen` and `onFiringChange`. It reads no clock, sorts
 * nothing, and does not decide what is next: `isNext` is the caller's answer
 * from `resolveNext` (W8). A firing task is never next, so `isNext` is ignored
 * on one.
 *
 * THREE SIBLINGS IN AN `li`, never a button inside a button: the toggle (the
 * active column only), a main button that opens the task, and the `menu` slot
 * (an `EllipsesMenu` the caller builds). Hover and focus are drawn on the `li`.
 *
 * VARIANTS.
 * - `active` — the toggle; the title; one words line (*next* · *firing · 4 min*
 *   or *back · 2 min*); on the person's rows, the note as one truncating line.
 *   Firing recedes: the title at `text-secondary`, no note, the words in
 *   `accent-text`. Nothing else changes — no border, no wash, no movement; the
 *   mark in the toggle is the one thing that moves (W5).
 * - `plain` — another column: the title and the menu, nothing else.
 * - `closed` — the done column's quiet register: `plain` at 0.55, still live.
 *
 * Durations are minutes, never seconds (`formatMinutesShort`): under a minute
 * the word stands alone with no middot. They are not a live region.
 *
 * `groupName` and `columnName` are not rendered — they compose the main
 * button's accessible name: title, group, column, then state, with durations
 * in words (*"…, Northwind, In progress, next, back 2 minutes"*).
 */
"use client";

import type { WorkflowTaskView } from "@syn/types";
import { formatMinutesShort } from "@syn/utils";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Skeleton } from "../../../primitives/display/skeleton";
import { Text } from "../../../primitives/typography/text";
import { FiringToggle } from "../../control/firing-toggle";
import { WORKFLOW_ROW_COPY, type WorkflowRowCopy } from "./copy";
import { taskRowVariants } from "./task-row.variants";

export type TaskRowVariant = "active" | "plain" | "closed";

export interface TaskRowProps {
  task: WorkflowTaskView;
  variant: TaskRowVariant;
  /** The caller's `resolveNext` answer. Ignored on a firing task. */
  isNext?: boolean;
  /** One `now` for the whole board (the caller's `useNow`, on the minute). */
  now: Date;
  /** For the accessible name only; null is *No group*. */
  groupName: string | null;
  /** For the accessible name only. */
  columnName: string;
  onOpen: () => void;
  /** The toggle's intent. Without it an active row's toggle is disabled. */
  onFiringChange?: (next: boolean) => void;
  /** An `EllipsesMenu` — visible on hover and focus on wide, always on compact. */
  menu?: React.ReactNode;
  disabled?: boolean;
  /** Mid-drag (FLO-9). */
  lifted?: boolean;
  copy?: Partial<WorkflowRowCopy>;
  className?: string;
}

function minutesSince(from: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - from.getTime()) / 60_000));
}

export function TaskRow({
  task,
  variant,
  isNext = false,
  now,
  groupName,
  columnName,
  onOpen,
  onFiringChange,
  menu,
  disabled = false,
  lifted = false,
  copy: copyOverride,
  className,
}: TaskRowProps) {
  const copy = { ...WORKFLOW_ROW_COPY, ...copyOverride };
  const active = variant === "active";
  const firing = active && task.firingStartedAt !== null;
  const next = active && isNext && !firing;
  const back = active && !firing && task.lastReturnedAt !== null;

  const firingMinutes = firing && task.firingStartedAt ? minutesSince(task.firingStartedAt, now) : 0;
  const backMinutes = back && task.lastReturnedAt ? minutesSince(task.lastReturnedAt, now) : 0;
  const firingShort = formatMinutesShort(firingMinutes);
  const backShort = formatMinutesShort(backMinutes);

  // What the row says, in order: next · then firing or back.
  const words: { key: string; text: string; className: string }[] = [];
  const spoken: string[] = [];
  if (next) {
    words.push({ key: "next", text: copy.next, className: "text-ink font-medium" });
    spoken.push(copy.next);
  }
  if (firing) {
    words.push({
      key: "firing",
      text: firingShort === "" ? copy.firing : `${copy.firing} · ${firingShort}`,
      className: "text-accent-text",
    });
    spoken.push(firingShort === "" ? copy.firing : `${copy.firing} ${copy.spokenMinutes(firingMinutes)}`);
  } else if (back) {
    words.push({
      key: "back",
      text: backShort === "" ? copy.back : `${copy.back} · ${backShort}`,
      className: "text-text-secondary",
    });
    spoken.push(backShort === "" ? copy.back : `${copy.back} ${copy.spokenMinutes(backMinutes)}`);
  }

  const accessibleName = [task.title, groupName ?? copy.noGroup, columnName, ...spoken].join(", ");
  const showNote = active && !firing && task.note !== null && task.note.trim() !== "";

  return (
    <li
      data-task-id={task.id}
      data-next={next || undefined}
      data-firing={firing || undefined}
      className={cn(
        taskRowVariants({ next, closed: variant === "closed", disabled, lifted }),
        !active && "ps-(--space-3)",
        className,
      )}
    >
      {active ? (
        <span className="flex shrink-0 items-start pt-(--space-1)">
          <FiringToggle
            pressed={firing}
            label={firing ? copy.markBack(task.title) : copy.fire(task.title)}
            onPressedChange={(wanted) => onFiringChange?.(wanted)}
            disabled={disabled || onFiringChange === undefined}
          />
        </span>
      ) : null}

      <button
        type="button"
        data-row-main=""
        onClick={onOpen}
        aria-label={accessibleName}
        className="flex min-w-0 flex-1 flex-col justify-center gap-(--space-1) py-(--space-2) text-left focus-visible:outline-none"
      >
        <Text
          as="span"
          variant="row-title"
          weight={500}
          tone={firing ? "secondary" : "ink"}
          truncate
          className={cn("block", disabled && "text-text-disabled")}
        >
          {task.title}
        </Text>

        {words.length > 0 ? (
          <Text as="span" variant="secondary" truncate className={cn("block", disabled && "text-text-disabled")}>
            {words.map((word, index) => (
              <React.Fragment key={word.key}>
                {index > 0 ? <span className="text-text-secondary"> · </span> : null}
                <span className={disabled ? undefined : word.className}>{word.text}</span>
              </React.Fragment>
            ))}
          </Text>
        ) : null}

        {showNote ? (
          <Text
            as="span"
            variant="secondary"
            tone="secondary"
            truncate
            className={cn("block", disabled && "text-text-disabled")}
          >
            {task.note}
          </Text>
        ) : null}
      </button>

      {menu === undefined ? null : (
        <span
          className={cn(
            "flex shrink-0 items-center",
            "wide:opacity-0 wide:group-hover/row:opacity-100 wide:group-focus-within/row:opacity-100",
            "transition-opacity duration-(--dur-state) ease-(--ease-settle)",
          )}
        >
          {menu}
        </span>
      )}
    </li>
  );
}

/** The row's shape while the board loads — 56px, the toggle's block and two bars. */
export function TaskRowSkeleton({ className }: { className?: string }) {
  return (
    <li
      aria-hidden="true"
      className={cn("flex min-h-(--row-min) items-center gap-(--space-1) pe-(--space-1)", className)}
    >
      <span className="flex size-(--target) shrink-0 items-center justify-center">
        <Skeleton className="size-2.5 rounded-(--radius-full)" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-(--space-2)">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </span>
    </li>
  );
}
