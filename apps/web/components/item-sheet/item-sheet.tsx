"use client";

import * as React from "react";

import {
  Button,
  CategoryChip,
  ConfirmDialog,
  HelperText,
  ItemIcon,
  NumberUnitInput,
  PreflightNote,
  ResponsiveSheet,
  SessionRow,
  SkeletonRow,
  StateWord,
  Text,
  TimerControl,
  TimerDisplay,
  ReflectionBlock,
  toastUndo,
  type Stepper17Value,
} from "@syn/ui";
import { UNDO_SHORT_MS } from "@syn/constants";
import type { CategoryKey, IconValue, TimerStatus } from "@syn/types";
import { formatCalendarDay, formatClock } from "@syn/utils";

import { OneOffSheet } from "@/components/one-off-sheet";
import { SheetHost } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";

import { ITEM_COPY as COPY } from "./copy";
import { ManualTimeSheet } from "./manual-time-sheet";
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
  autoStart = false,
  onOpenChange,
}: {
  open: boolean;
  itemId: string | null;
  dayKey: string;
  /**
   * USE-8's `?action=start`: a notification's *Start* button lands here with
   * the timer already meant to be running.
   */
  autoStart?: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const sheet = useItemSheet(open ? itemId : null, dayKey);
  const utils = trpc.useUtils();
  const { item } = sheet;

  const [quantity, setQuantity] = React.useState<number | null>(null);
  const [note, setNote] = React.useState("");
  const [manual, setManual] = React.useState<{
    session: ItemDetail["sessions"][number] | null;
  } | null>(null);
  const [editOneOff, setEditOneOff] = React.useState(false);
  const [removeOpen, setRemoveOpen] = React.useState(false);

  React.useEffect(() => {
    if (item === null) return;
    setQuantity(item.quantityValue);
    setNote(item.notesReflection ?? "");
  }, [item]);

  /**
   * *Start* from a notification, once.
   *
   * It checks that nothing is already running: a person who tapped *Start* and
   * then opened the app a minute later must not restart a timer that is
   * already going, and `timer.start` is idempotent anyway — this just avoids
   * the round trip.
   */
  const started = React.useRef(false);
  React.useEffect(() => {
    if (!autoStart || item === null || started.current) return;
    if (item.runningSince !== null) return;
    started.current = true;
    sheet.onStart();
  }, [autoStart, item, sheet]);

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
        header={
          item === null ? undefined : (
            <IdentityRow
              item={item}
              onEditOneOff={() => setEditOneOff(true)}
            />
          )
        }
        footer={
          item === null ? null : (
            <div className="flex items-center justify-between gap-(--space-2)">
              <div className="flex items-center gap-(--space-2)">
                {/*
                 * *Remove* is a one-off's alone (cross-cutting §9.3 G1). A
                 * template-derived item is not deleted from a day — the
                 * template put it there, and the way to change that is to
                 * change the template or remove it from the day.
                 */}
                {item.origin === "one_off" ? (
                  <Button variant="ghost" onClick={() => setRemoveOpen(true)}>
                    {COPY.removeOneOff}
                  </Button>
                ) : null}

                {recordMode || done ? null : (
                  <Button variant="ghost" onClick={sheet.onToggleDeferred}>
                    {item.deferredAt === null
                      ? COPY.notTodayAction
                      : COPY.backInTheList}
                  </Button>
                )}
              </div>
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
                status={timerStatus(sheet.running, sheet.paused)}
              />
              <TimerControl
                status={timerStatus(sheet.running, sheet.paused)}
                onStart={sheet.onStart}
                onStop={sheet.onStop}
                onPause={sheet.onPause}
                onResume={sheet.onResume}
                pauseEnabled
                busy={sheet.busy}
              />

              <Button
                variant="ghost"
                className="self-start"
                onClick={() => setManual({ session: null })}
              >
                {COPY.addTimeByHand}
              </Button>

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
                        onEdit={() => setManual({ session })}
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

      <ManualTimeSheet
        open={manual !== null}
        item={item}
        session={manual?.session ?? null}
        onOpenChange={(next) => {
          if (!next) setManual(null);
        }}
        onSaved={() => undefined}
      />

      {/* G1's *Edit* — WK-03 in edit mode, stacked over this sheet. */}
      {item === null ? null : (
        <OneOffSheet
          open={editOneOff}
          date={item.dayKey}
          itemId={item.id}
          onOpenChange={setEditOneOff}
          onSaved={() => void utils.item.get.invalidate({ id: item.id })}
        />
      )}

      {item === null ? null : (
        <RemoveOneOffDialog
          open={removeOpen}
          item={item}
          onOpenChange={setRemoveOpen}
          onRemoved={() => onOpenChange(false)}
        />
      )}
    </SheetHost>
  );
}

/** `TimerControl`'s three states, from the two facts that produce them. */
function timerStatus(running: boolean, paused: boolean): TimerStatus {
  if (running) return "running";
  return paused ? "paused" : "idle";
}

/**
 * G1's *Remove*, with the two bodies §9.3 and §8.2 specify.
 *
 * ON A REVIEWED DAY THE DIALOG NAMES WHAT THE ITEM WAS. Removing something
 * from a record changes a number that has already been shown, so the question
 * says what is being taken out rather than asking in the abstract.
 */
function RemoveOneOffDialog({
  open,
  item,
  onOpenChange,
  onRemoved,
}: {
  open: boolean;
  item: ItemDetail;
  onOpenChange: (open: boolean) => void;
  onRemoved: () => void;
}) {
  const utils = trpc.useUtils();
  const remove = trpc.week.removeOneOff.useMutation();
  const restore = trpc.week.restoreOneOff.useMutation();

  const reviewed = item.mode === "record";

  async function refresh(): Promise<void> {
    await utils.day.get.invalidate({ date: item.dayKey });
    await utils.review.day.invalidate({ date: item.dayKey });
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        reviewed
          ? COPY.removeReviewedTitle(
              item.title,
              formatCalendarDay(
                new Date(`${item.dayKey}T12:00:00Z`),
                "UTC",
                "long",
              ),
              outcomeOf(item),
            )
          : COPY.removeTitle(item.title)
      }
      confirmLabel={COPY.removeOneOff}
      cancelLabel={COPY.keep}
      busy={remove.isPending}
      onConfirm={() => {
        void remove.mutateAsync({ id: item.id }).then(async (payload) => {
          await refresh();
          onOpenChange(false);
          onRemoved();

          toastUndo({
            text: COPY.removed(item.title),
            durationMs: UNDO_SHORT_MS,
            onUndo: () => {
              void restore.mutateAsync({ payload }).then(refresh);
            },
          });
        });
      }}
      onCancel={() => onOpenChange(false)}
    />
  );
}

/** "done 7:24" · "carried" · "missed" — what the item was, for §8.2's body. */
function outcomeOf(item: ItemDetail): string {
  if (item.doneAt !== null) {
    return COPY.doneAt(formatClock(item.doneAt, item.timezone));
  }
  if (item.state === "carried") return "carried";
  return "missed";
}

/**
 * Icon, title, chip, type word — the date in record mode, and USE-4's three
 * additions.
 *
 * *EDIT* AND *FROM {template}* ARE THE SAME SLOT. A one-off can be changed
 * from here; a template-derived item cannot, and the line says where it came
 * from instead — so the absence of the action is explained rather than simply
 * missing (cross-cutting §9.3 G1).
 *
 * *ARCHIVED* SITS BESIDE THE TYPE WORD (§8.3). The item renders from its own
 * snapshot and behaves normally; the word is there so somebody who goes
 * looking for the habit and cannot find it knows why.
 */
function IdentityRow({
  item,
  onEditOneOff,
}: {
  item: ItemDetail;
  onEditOneOff: () => void;
}) {
  const isOneOff = item.origin === "one_off";

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
        {item.habitArchived ? <StateWord kind="archived" /> : null}

        {isOneOff ? (
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={onEditOneOff}
          >
            {COPY.editOneOff}
          </Button>
        ) : null}
      </div>

      {isOneOff ? null : (
        <Text as="span" variant="caption" tone="secondary">
          {item.templateNameSnapshot === null
            ? COPY.fromATemplate
            : COPY.fromTemplate(item.templateNameSnapshot)}
        </Text>
      )}

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
