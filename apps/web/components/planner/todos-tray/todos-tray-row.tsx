"use client";

import * as React from "react";
import { Checkbox, cn, ItemIcon, ReminderIcon, Text } from "@syn/ui";
import type { TrayRowView } from "@/lib/data/use-todos";
import { TODOS_TRAY_COPY as COPY, trayClock } from "./copy";

/**
 * One to-do in the tray (open.md): the box, the to-do's own icon (muted), the
 * title, and on the right a bell with its time or "From <weekday>". Checked,
 * it fades and stays live (P-A07). The reminded row is tinted for a moment
 * and its time reads in ink (from-a-reminder.md). A box that did not save
 * says so under the row, in ink.
 */
export interface TodosTrayRowProps {
  row: TrayRowView;
  /** The to-do a reminder opened the tray on. */
  reminded?: boolean;
  /** The tint, while it lasts. */
  tinted?: boolean;
  failed?: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
  onRetry: (id: string) => void;
}

export const TodosTrayRow = React.forwardRef<HTMLDivElement, TodosTrayRowProps>(
  function TodosTrayRow(
    {
      row,
      reminded = false,
      tinted = false,
      failed = false,
      onCheckedChange,
      onOpen,
      onRetry,
    },
    ref,
  ) {
    return (
      <div ref={ref} data-todo-row={row.id}>
        <div
          data-checked={row.checked || undefined}
          className={cn(
            "flex min-h-(--target) items-center rounded-(--radius-control) pe-(--space-2)",
            "transition-colors duration-(--dur-state) ease-(--ease-settle)",
            tinted ? "bg-surface" : "hover:bg-surface",
          )}
        >
          <span className="flex size-(--target) shrink-0 items-center justify-center">
            <Checkbox
              checked={row.checked}
              aria-label={COPY.boxName(row.title)}
              className="data-[state=checked]:border-text-muted data-[state=checked]:bg-text-muted"
              onCheckedChange={(value) =>
                onCheckedChange(row.id, value === true)
              }
            />
          </span>
          <button
            type="button"
            onClick={() => onOpen(row.id)}
            aria-label={COPY.rowName(row.title)}
            className="flex min-h-(--target) min-w-0 flex-1 cursor-pointer items-center gap-(--space-3) text-start"
          >
            <ItemIcon icon={row.icon} size={20} muted />
            <Text
              as="span"
              variant="body"
              tone={row.checked ? "muted" : "ink"}
              truncate
            >
              {row.title}
            </Text>
          </button>
          {row.reminderAt !== null ? (
            <span className="flex shrink-0 items-center gap-(--space-1) ps-(--space-2)">
              <ReminderIcon
                aria-hidden="true"
                className={cn(
                  "size-3",
                  reminded ? "text-ink" : "text-text-muted",
                )}
              />
              <Text
                as="span"
                variant="secondary"
                tone={reminded ? "ink" : "muted"}
                weight={reminded ? 600 : 400}
                className="tabular-nums"
              >
                <span className="sr-only">{COPY.reminder(row.reminderAt)}</span>
                <span aria-hidden="true">{trayClock(row.reminderAt)}</span>
              </Text>
            </span>
          ) : row.carriedLabel !== null ? (
            <Text
              as="span"
              variant="secondary"
              tone="muted"
              className="shrink-0 ps-(--space-2)"
            >
              {row.carriedLabel}
            </Text>
          ) : null}
        </div>
        {failed ? (
          <p role="status" className="ps-(--target) pb-(--space-2)">
            <Text as="span" variant="secondary" tone="ink">
              {COPY.notSaved}{" "}
              <button
                type="button"
                onClick={() => onRetry(row.id)}
                className="cursor-pointer underline underline-offset-2"
              >
                {COPY.tryAgain}
              </button>
              .
            </Text>
          </p>
        ) : null}
      </div>
    );
  },
);
