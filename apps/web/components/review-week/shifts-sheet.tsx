"use client";

import { Button, EmptyState, ResponsiveSheet, ShiftRow, Text } from "@syn/ui";
import { formatClock, weekdayForDayKey } from "@syn/utils";

import { SheetHost } from "@/components/page-frame";
import { trpc } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";

/**
 * WR-04 — the week's shifts.
 *
 * READ-ONLY, AND NO UNDO HERE. A shift is undoable for ten minutes from the
 * Schedule (USE-6's SC-02); by the time a week report is being read, every
 * shift in it has settled into a record. Offering an undo that would be
 * refused for all but the newest row would be an action that mostly fails.
 *
 * THE SUMMARY COUNTS REASONS RATHER THAN RANKING THEM. *slept in ×3, something
 * came up ×1* is a tally; "you mostly slept in" would be a conclusion, and
 * conclusions are the reader's.
 */
export function ShiftsSheet({
  open,
  weekKey,
  onOpenChange,
}: {
  open: boolean;
  weekKey: string;
  onOpenChange: (open: boolean) => void;
}) {
  const week = trpc.review.week.useQuery({ week: weekKey }, { enabled: open });
  const rows = week.data?.shiftRows ?? [];
  // The person's zone, from the week's own model — never the viewer's device.
  const timeZone = week.data?.timezone ?? "UTC";

  return (
    <SheetHost open={open}>
      <ResponsiveSheet
        open={open}
        onOpenChange={onOpenChange}
        title={COPY.shiftsTitle}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{COPY.close}</Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState text={COPY.noShifts} density="inline" />
        ) : (
          <div className="flex flex-col gap-(--space-3)">
            <ul className="flex flex-col">
              {rows.map((row) => (
                <ShiftRow
                  key={row.id}
                  weekday={weekdayForDayKey(row.date)}
                  deltaMin={row.deltaMin}
                  atLabel={formatClock(row.at, timeZone)}
                  reason={row.reasonLabel ?? ""}
                  cutCount={row.cutCount}
                />
              ))}
            </ul>
            <Text as="p" tone="secondary">
              {summaryOf(rows)}
            </Text>
          </div>
        )}
      </ResponsiveSheet>
    </SheetHost>
  );
}

/** "2 shifts · +90 min · reasons: slept in ×2" */
function summaryOf(
  rows: readonly { deltaMin: number; reasonLabel: string | null }[],
): string {
  const totalMin = rows.reduce((sum, row) => sum + row.deltaMin, 0);

  const counts = new Map<string, number>();
  for (const row of rows) {
    if (row.reasonLabel === null) continue;
    counts.set(row.reasonLabel, (counts.get(row.reasonLabel) ?? 0) + 1);
  }

  const reasons = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => `${label} ×${count}`)
    .join(", ");

  const head = `${rows.length} ${rows.length === 1 ? "shift" : "shifts"} · +${totalMin} min`;
  return reasons.length === 0 ? head : `${head} · reasons: ${reasons}`;
}
