"use client";

import * as React from "react";

import {
  Button,
  CategoryChip,
  HelperText,
  ItemIcon,
  NumberUnitInput,
  PreflightNote,
  ResponsiveSheet,
  SessionRow,
  SkeletonRow,
  Text,
  TimerControl,
  TimerDisplay,
  ReflectionBlock,
  type Stepper17Value,
} from "@syn/ui";
import type { CategoryKey, IconValue } from "@syn/types";
import { formatCalendarDay, formatClock } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";

import { ITEM_COPY as COPY } from "./copy";
import { useItemSheet, type ItemDetail } from "./use-item-sheet";

/**
 * IT-01 — everything about one item, in one sheet.
 *
 * IT NEVER NAVIGATES (cross-cutting §1.2). Back closes it and the list is
 * exactly where it was; the URL carries `?sheet=item&id=…` so a reload and a
 * notification landing both reopen the same thing.
 *
 * THERE IS NO DISCARD PROMPT, because there is nothing unsaved: the quantity
 * and the note flush on blur and on close, and the steppers save on change.
 * A sheet that asked "discard your changes?" about fields it had already
 * decided to autosave would be asking about a state that does not exist.
 *
 * *DONE* NEVER REQUIRES A TIMER, A QUANTITY, OR A REFLECTION. Every one of
 * those is optional on every item, and the primary is enabled regardless —
 * this screen records what happened, it does not gate it.
 *
 * RECORD MODE HAS NO *NOT TODAY* (cross-cutting §9.3 G3). Deferring something
 * to a day that has already ended is not a thing anyone can mean.
 */
export function ItemSheet({
  open,
  itemId,
  dayKey,
  onOpenChange,
}: {
  open: boolean;
  itemId: string | null;
  dayKey: string;
  onOpenChange: (open: boolean) => void;
}) {
  const sheet = useItemSheet(open ? itemId : null, dayKey);
  const { item } = sheet;

  const [quantity, setQuantity] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (item === null) return;
    setQuantity(item.quantityValue);
    setNote(item.notesReflection ?? "");
  }, [item]);

  /** Closing flushes what blur has not. */
  function close(): void {
    sheet.onSaveQuantity(quantity);
    sheet.onSaveNote(note);
    onOpenChange(false);
  }

  const recordMode = item?.mode === "record";
  const done = item?.doneAt != null;

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
          else onOpenChange(true);
        }}
        title={item?.title ?? ""}
        size="tall"
        initialFocus="title"
        header={item === null ? undefined : <IdentityRow item={item} />}
        footer={
          item === null ? null : (
            <div className="flex items-center justify-between gap-(--space-2)">
              {recordMode || done ? (
                <span />
              ) : (
                <Button variant="ghost" onClick={sheet.onToggleDeferred}>
                  {item.deferredAt === null
                    ? COPY.notTodayAction
                    : COPY.backInTheList}
                </Button>
              )}
              <Button
                variant={done ? "secondary" : "default"}
                busy={sheet.busy}
                onClick={sheet.onToggleDone}
              >
                {done ? COPY.undoDone : COPY.done}
              </Button>
            </div>
          )
        }
      >
        {item === null ? (
          <div className="flex flex-col gap-(--space-2)">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="flex flex-col gap-(--space-5)">
            <Text as="p" variant="secondary" tone="secondary">
              {timeLine(item)}
            </Text>

            {stateLine(item, sheet.elapsedSec) === null ? null : (
              <Text as="p" variant="secondary" tone="secondary">
                {stateLine(item, sheet.elapsedSec)}
              </Text>
            )}

            {item.notesPreflight === null ? null : (
              <PreflightNote>{item.notesPreflight}</PreflightNote>
            )}

            <section className="flex flex-col gap-(--space-3)">
              <TimerDisplay
                elapsedSec={sheet.elapsedSec ?? item.loggedSec}
                status={sheet.running ? "running" : "idle"}
              />
              <TimerControl
                status={sheet.running ? "running" : "idle"}
                onStart={sheet.onStart}
                onStop={sheet.onStop}
                // USE-4 enables pause and resume; until then the control shows
                // two buttons rather than a third that does nothing.
                pauseEnabled={false}
                busy={sheet.busy}
              />

              {item.sessions.length === 0 ? null : (
                <ul className="flex flex-col">
                  {item.sessions
                    .filter((session) => session.endedAt !== null)
                    .map((session) => (
                      <SessionRow
                        key={session.id}
                        startLabel={formatClock(
                          session.startedAt,
                          item.timezone,
                        )}
                        endLabel={formatClock(
                          session.endedAt ?? session.startedAt,
                          item.timezone,
                        )}
                        minutes={minutesBetween(
                          session.startedAt,
                          session.endedAt,
                        )}
                        source={session.source}
                        // USE-4 wires editing; the affordance is inert here
                        // rather than absent, because `SessionRow` requires it.
                        onEdit={() => undefined}
                      />
                    ))}
                </ul>
              )}
            </section>

            {item.quantityUnit === null ? null : (
              <NumberUnitInput
                label={item.quantityUnit}
                unit={item.quantityUnit}
                value={quantity}
                decimal
                onChange={setQuantity}
                onBlur={() => sheet.onSaveQuantity(quantity)}
              />
            )}

            {item.reflectionAxes.length === 0 && !done ? null : (
              <ReflectionBlock
                item={{ icon: item.icon as IconValue, title: item.title }}
                axes={item.reflectionAxes.map((axis) => ({
                  key: axis,
                  label: axis,
                  value: (item.reflectionRatings[axis] ?? null) as
                    | Stepper17Value
                    | null,
                }))}
                note={note}
                onRate={(axis, value) => sheet.onRate(axis, value)}
                onNoteChange={setNote}
              />
            )}

            {sheet.error === null ? null : (
              <HelperText error>{sheet.error}</HelperText>
            )}
          </div>
        )}
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** Icon, title, chip, type word — and the date in record mode. */
function IdentityRow({ item }: { item: ItemDetail }) {
  return (
    <div className="flex flex-col gap-(--space-1)">
      <div className="flex items-center gap-(--space-3)">
        <ItemIcon icon={item.icon as IconValue} size={24} />
        <Text as="h2" variant="row-title" weight={500} tabIndex={-1} truncate>
          {item.title}
        </Text>
        {item.category === null ? null : (
          <CategoryChip
            categoryKey={item.category.key as CategoryKey}
            name={item.category.name}
          />
        )}
        <Text as="span" variant="caption" tone="secondary">
          {typeWord(item.type)}
        </Text>
      </div>

      {item.mode === "record" ? (
        <Text as="span" variant="caption" tone="secondary">
          {formatCalendarDay(
            new Date(`${item.dayKey}T12:00:00Z`),
            "UTC",
            "long",
          )}
        </Text>
      ) : null}
    </div>
  );
}

function typeWord(type: string): string {
  if (type === "task_appointment") return COPY.typeTask;
  if (type === "deep_work") return COPY.typeDeepWork;
  return COPY.typeHabit;
}

/** "at 7:20 · 40 min · Fixed" */
function timeLine(item: ItemDetail): string {
  const parts: string[] = [];

  if (item.timeMode === "unscheduled" || item.scheduledStart === null) {
    parts.push(COPY.anytime);
  } else if (item.timeMode === "window" && item.scheduledEnd !== null) {
    parts.push(
      COPY.between(
        formatClock(item.scheduledStart, item.timezone),
        formatClock(item.scheduledEnd, item.timezone),
      ),
    );
  } else {
    parts.push(COPY.at(formatClock(item.scheduledStart, item.timezone)));
  }

  if (item.durationMin !== null) parts.push(COPY.minutes(item.durationMin));
  if (item.scheduling === "hard") parts.push(COPY.fixed);

  return parts.join(" · ");
}

/**
 * The one line of state, when there is one.
 *
 * A LATE START IS ANNOUNCED BY THE GAP between `original_scheduled_start` and
 * where the item ended up — the same fact the Schedule will draw as a ghost
 * (USE-5). "done 14:52 — moved from 7:45" is the record being annotated rather
 * than rewritten, which is the promise the whole product makes.
 */
function stateLine(item: ItemDetail, elapsedSec: number | null): string | null {
  if (elapsedSec !== null) {
    return COPY.timerRunning(formatElapsed(elapsedSec));
  }

  if (item.doneAt !== null) {
    const moved =
      item.originalScheduledStart !== null &&
      item.scheduledStart !== null &&
      item.originalScheduledStart.getTime() !== item.scheduledStart.getTime();

    return moved && item.originalScheduledStart !== null
      ? COPY.doneMovedFrom(
          formatClock(item.doneAt, item.timezone),
          formatClock(item.originalScheduledStart, item.timezone),
        )
      : COPY.doneAt(formatClock(item.doneAt, item.timezone));
  }

  if (item.deferredAt !== null) return COPY.notToday;

  const ended = item.sessions.filter((session) => session.endedAt !== null);
  if (ended.length > 0) {
    return COPY.timeLogged(Math.round(item.loggedSec / 60), ended.length);
  }

  return null;
}

function minutesBetween(start: Date, end: Date | null): number {
  if (end === null) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

function formatElapsed(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
