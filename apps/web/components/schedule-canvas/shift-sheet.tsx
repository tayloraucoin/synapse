"use client";

import { Button, ResponsiveSheet, Text } from "@syn/ui";
import { formatClock } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import type { RouterOutputs } from "@/lib/trpc/client";

import { SCHEDULE_COPY as COPY } from "./copy";

type DayView = RouterOutputs["day"]["get"];

/**
 * SC-02 — what one shift did, as a record.
 *
 * IT IS READ-ONLY HERE. *Undo this shift* and its ten-minute rule belong to
 * USE-6, which is what writes shifts in the first place; an undo offered by a
 * ticket that cannot create the thing it undoes would be an action with no
 * tested path back.
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
export function ShiftSheet({
  open,
  day,
  shiftId,
  onOpenChange,
}: {
  open: boolean;
  day: DayView;
  shiftId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const shift = day.shifts.find((row) => row.id === shiftId) ?? null;

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
          <div className="flex justify-end">
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
          </div>
        )}
      </ResponsiveSheet>
    </SheetHost>
  );
}
