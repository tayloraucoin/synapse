"use client";

import * as React from "react";

import { Button, HelperText, ResponsiveSheet, Text } from "@syn/ui";
import { formatClock } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { SHIFT_COPY } from "@/components/shift-sheet";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { SCHEDULE_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * SC-02 — what one shift did, as a record.
 *
 * NAMED `ShiftRecordSheet`, NOT `ShiftSheet`. USE-6 added a `ShiftSheet` that
 * CREATES a shift (SF-01, `components/shift-sheet/`); two exports with one
 * name in one app is an auto-import that is right half the time. This one
 * reads a shift that already happened, and the name says so.
 *
 * *UNDO THIS SHIFT* APPEARS ONLY WHILE IT WOULD BE A TRUE REVERSAL (USE-6).
 * The server decides — within ten minutes, no later shift, and nothing that was
 * cut has since been done anyway — and when it says no, the action is ABSENT
 * rather than disabled. A greyed *Undo* on a record that has settled would
 * invite a tap that can only ever fail, and the record settling is not an error
 * state; it is the point.
 *
 * IT NAMES WHAT WAS CUT, OR SAYS NOTHING WAS. *Nothing was cut.* is a real
 * answer — a shift that moved the day without dropping anything is the good
 * outcome, and leaving the line out would make its absence read as missing
 * information rather than as nothing having happened.
 *
 * THE TIER PHRASE IS ST-06's HEADING, verbatim (official spec §10.2). The same
 * words that define the tier where a person chose it are the words that report
 * it here, so the vocabulary is learned once.
 */
export function ShiftRecordSheet({
  open,
  day,
  shiftId,
  onOpenChange,
  onUndone,
}: {
  open: boolean;
  day: DayView;
  shiftId: string | null;
  onOpenChange: (open: boolean) => void;
  onUndone?: () => void;
}) {
  const shift = day.shifts.find((row) => row.id === shiftId) ?? null;

  const eligibility = trpc.shift.canUndo.useQuery(
    { shiftId: shiftId ?? "" },
    { enabled: open && shiftId !== null },
  );
  const undo = trpc.shift.undo.useMutation();
  const [error, setError] = React.useState<string | null>(null);

  const canUndo = eligibility.data?.canUndo === true;

  async function runUndo(): Promise<void> {
    if (shiftId === null) return;
    setError(null);
    try {
      await undo.mutateAsync({ shiftId });
      onOpenChange(false);
      onUndone?.();
    } catch {
      // The window closed, or something was done anyway, while the sheet was
      // open — the record won, which is the correct outcome.
      setError(SHIFT_COPY.undoRefused);
    }
  }

  // What this shift took, by the `misses.shift_id` link the day view resolves.
  const cutTitles = day.cutByShift
    .filter((item) => day.cutByShiftIds[item.id] === shiftId)
    .map((item) => item.title);

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open && shift !== null}
        onOpenChange={onOpenChange}
        title={shift === null ? "" : COPY.shiftedTitle(shift.deltaMin)}
        footer={
          <div className="flex justify-end gap-(--space-2)">
            {canUndo ? (
              <Button
                variant="ghost"
                busy={undo.isPending}
                onClick={() => void runUndo()}
              >
                {SHIFT_COPY.undoThisShift}
              </Button>
            ) : null}
            <Button onClick={() => onOpenChange(false)}>{COPY.close}</Button>
          </div>
        }
      >
        {shift === null ? null : (
          <div className="flex flex-col gap-(--space-2)">
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.at(formatClock(shift.at, day.timezone))}
            </Text>
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.reason(shift.reasonLabel ?? "")}
            </Text>
            <Text as="p" variant="secondary" tone="secondary">
              {COPY.countsAs(COPY.tierPhrase[shift.tier])}
            </Text>
            <Text as="p" variant="secondary" tone="secondary">
              {cutTitles.length === 0
                ? COPY.nothingWasCut
                : COPY.cut(cutTitles.join(", "))}
            </Text>
            {error === null ? null : <HelperText error>{error}</HelperText>}
          </div>
        )}
      </ResponsiveSheet>
    </SheetHost>
  );
}
