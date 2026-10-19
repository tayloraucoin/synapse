"use client";

import * as React from "react";

import {
  Button,
  ResponsiveSheet,
  Text,
  TimeField,
} from "@syn/ui";
import { UNDO_SHORT_MS } from "@syn/constants";
import { toastUndo } from "@syn/ui";
import { dayWindow, wallClockToInstant } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";

import { ITEM_COPY as COPY } from "./copy";
import type { ItemDetail } from "./use-item-sheet";

/**
 * IT-02 — time added by hand.
 *
 * IT EXISTS BECAUSE FORGETTING THE TIMER IS NORMAL. Official spec §5.4 makes
 * manual entry "always available": a record that can only be written by
 * remembering to press a button in advance would systematically undercount
 * exactly the days somebody was too busy to press it.
 *
 * THE BOUNDS ARE THE DAY'S OWN WINDOW, in the day's zone. A session belongs to
 * the day it is filed under, and typing 02:00 on a day that closes at 03:00
 * has to mean that day's 02:00 rather than the calendar's.
 *
 * TWO ERRORS ARE THE FORM'S AND ONE IS THE SERVER'S. Order is a fact about the
 * two fields in front of you; overlap is a question about the item's other
 * sessions, which the browser does not have. The sheet renders whichever
 * arrives.
 */
export function ManualTimeSheet({
  open,
  item,
  session,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  item: ItemDetail | null;
  /** Null to add; a session to edit. */
  session: ItemDetail["sessions"][number] | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const utils = trpc.useUtils();
  const add = trpc.timer.addManual.useMutation();
  const update = trpc.timer.updateSession.useMutation();
  const remove = trpc.timer.removeSession.useMutation();
  const restore = trpc.timer.restoreSession.useMutation();

  const [from, setFrom] = React.useState("09:00");
  const [to, setTo] = React.useState("09:30");
  const [error, setError] = React.useState<string | null>(null);

  const zone = item?.timezone ?? "UTC";

  React.useEffect(() => {
    if (!open || item === null) return;
    setError(null);

    if (session !== null) {
      setFrom(clockIn(session.startedAt, zone));
      setTo(clockIn(session.endedAt ?? session.startedAt, zone));
      return;
    }

    // Defaults: the item's own scheduled window, which is the answer for
    // somebody who did the thing when they meant to and forgot to time it.
    const start = item.scheduledStart;
    if (start !== null) {
      setFrom(clockIn(start, zone));
      const end =
        item.scheduledEnd ??
        new Date(start.getTime() + (item.durationMin ?? 30) * 60_000);
      setTo(clockIn(end, zone));
    }
  }, [open, item, session, zone]);

  // The day's own window — its zone AND its close time, both snapshotted on
  // the row, so the picker cannot offer a time that belongs to another day.
  const bounds = React.useMemo(() => {
    if (item === null) return null;
    return dayWindow(item.dayKey, zone, item.dayCloseTime);
  }, [item, zone]);

  const minutes = React.useMemo(() => {
    if (item === null) return null;
    const start = wallClockToInstant(item.dayKey, from, zone);
    const end = wallClockToInstant(item.dayKey, to, zone);
    const diff = Math.round((end.getTime() - start.getTime()) / 60_000);
    return diff > 0 ? diff : null;
  }, [item, from, to, zone]);

  async function save(): Promise<void> {
    if (item === null) return;
    setError(null);

    const startedAt = wallClockToInstant(item.dayKey, from, zone);
    const endedAt = wallClockToInstant(item.dayKey, to, zone);

    try {
      if (session === null) {
        await add.mutateAsync({ itemId: item.id, startedAt, endedAt });
      } else {
        await update.mutateAsync({ id: session.id, startedAt, endedAt });
      }
      await utils.item.get.invalidate({ id: item.id });
      onSaved();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : COPY.saveError);
    }
  }

  function removeThis(): void {
    if (session === null || item === null) return;

    void remove.mutateAsync({ id: session.id }).then(async (payload) => {
      await utils.item.get.invalidate({ id: item.id });
      onSaved();
      onOpenChange(false);

      if (payload === null) return;
      toastUndo({
        text: COPY.removedSession,
        durationMs: UNDO_SHORT_MS,
        onUndo: () => {
          void restore.mutateAsync({ payload }).then(async () => {
            await utils.item.get.invalidate({ id: item.id });
            onSaved();
          });
        },
      });
    });
  }

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={session === null ? COPY.addTime : COPY.editTime}
        footer={
          <div className="flex items-center justify-between gap-(--space-2)">
            {session === null ? (
              <span />
            ) : (
              <Button
                variant="ghost"
                busy={remove.isPending}
                onClick={removeThis}
              >
                {COPY.removeThisSession}
              </Button>
            )}
            <div className="flex gap-(--space-2)">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                {COPY.cancel}
              </Button>
              <Button
                busy={add.isPending || update.isPending}
                onClick={() => void save()}
              >
                {COPY.save}
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-(--space-4)">
          <TimeField
            label={COPY.from}
            value={from}
            onChange={setFrom}
            min={bounds === null ? undefined : clockIn(bounds.start, zone)}
            max={bounds === null ? undefined : clockIn(bounds.end, zone)}
          />
          <TimeField
            label={COPY.to}
            value={to}
            onChange={setTo}
            min={bounds === null ? undefined : clockIn(bounds.start, zone)}
            max={bounds === null ? undefined : clockIn(bounds.end, zone)}
            error={error ?? undefined}
          />

          {/*
           * Announced on change rather than per keystroke: a native time field
           * commits a whole value at a time, so this never reads a half-typed
           * number aloud.
           */}
          <Text as="p" variant="secondary" tone="secondary" aria-live="polite">
            {minutes === null ? COPY.noDuration : COPY.minutes(minutes)}
          </Text>
        </div>
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** "14:45" — the wall clock in the day's zone. */
function clockIn(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(at);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "09";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}
