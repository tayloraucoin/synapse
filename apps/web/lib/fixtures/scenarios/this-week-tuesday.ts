import { dayEventRecord, slotRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import { POOL_SHEET_IDS } from "./pool-sheet";
import { SET_UP_IDS } from "./set-up";

/**
 * The board's Tuesday 13 on the place sheet's week, as This week's day
 * (USE-81) draws it and the place sheet's `placed-undo` (USE-80) lands on:
 * [Booking: reschedule flow] (KES-58) in Primary, [Brand site: case study
 * template] (ALD-22) in Secondary for an hour, and "15:30 [Dentist]" on its
 * own. `placed-undo` leaves KES-58 out, for its Place to add. Bracketed
 * names are the boards' placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** This week's day ids count from 861. */
const id = (table: number, n: number) => fixtureId(table, 860 + n);

export const THIS_WEEK_DAY_IDS = {
  slots: { kes58Tue: id(3, 1), ald22Tue: id(3, 2) },
  dentist: id(8, 1),
} as const;

export const TUE = "2026-10-13";

const W = POOL_SHEET_IDS.workItems;
const S = THIS_WEEK_DAY_IDS.slots;

function slot(
  slotId: string,
  workItemId: string,
  tier: "primary" | "secondary",
  sortOrder: number,
  lengthMin: number | null,
) {
  return slotRecord.parse({
    ...stamps,
    id: slotId,
    blockId: SET_UP_IDS.blocks.work,
    onDate: TUE,
    skipped: false,
    sortOrder,
    blockItemId: null,
    todoId: null,
    workItemId,
    tier,
    lengthMin,
    tookMin: null,
    doneAt: null,
  });
}

/** Tuesday's slots and its Dentist; `kes58: false` before KES-58 is placed. */
export function tuesdayRecords({ kes58 }: { kes58: boolean }) {
  return {
    slots: [
      ...(kes58 ? [slot(S.kes58Tue, W.kes58, "primary", 40, null)] : []),
      slot(S.ald22Tue, W.ald22, "secondary", 41, 60),
    ],
    dayEvents: [
      dayEventRecord.parse({
        ...stamps,
        id: THIS_WEEK_DAY_IDS.dentist,
        onDate: TUE,
        rrule: null,
        title: "[Dentist]",
        icon: null,
        startsAt: "15:30",
        endsAt: "16:30",
        tag: "personal",
        notes: null,
        color: null,
        clientId: null,
      }),
    ],
  };
}
