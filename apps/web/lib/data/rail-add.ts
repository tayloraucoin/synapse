import type {
  AddForm,
  AddLanding,
  AddPlan,
} from "@/components/planner/add-sheet/form";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { RoomAddition } from "./room";
import type { TodayRecords } from "./today-records";
import type { DayEdit, DayEditsServer } from "./use-day-edits";

/**
 * The add with room (USE-54; D-USE-11: free time absorbs it, no question).
 * On the date only, never the usual week (note 18): outside Work a dated
 * item (`onDate`), its set time when pinned; inside Work a new work item and
 * its slot on the date with the tier and length. Its Undo takes it all off.
 */

export type AddServer = DayEditsServer & Pick<FixtureServer, "createTask">;

export interface RailAddEdit extends DayEdit {
  /** The new row: the dated item, or the work item. */
  id: string;
}

/** After the last of the block's rows on the date. */
function nextSortOrder(records: TodayRecords, blockId: string): number {
  const orders = [
    ...records.blockItems
      .filter(
        (item) =>
          item.blockId === blockId &&
          (item.onDate === null || item.onDate === records.date),
      )
      .map((item) => item.sortOrder),
    ...records.slots
      .filter(
        (slot) => slot.blockId === blockId && slot.onDate === records.date,
      )
      .map((slot) => slot.sortOrder),
  ];
  return orders.reduce((top, order) => Math.max(top, order), -1) + 1;
}

export async function writeRailAdd(
  server: AddServer,
  records: TodayRecords,
  landing: AddLanding,
  form: AddForm,
): Promise<RailAddEdit> {
  const sortOrder = nextSortOrder(records, landing.blockId);
  const notes = form.notes.trim();
  if (landing.work) {
    // The work item alone (no days), then its one slot on this date.
    const created = await server.createTask({
      item: {
        title: form.title,
        icon: form.icon,
        notes: notes === "" ? null : notes,
      },
      tier: form.tier,
      days: [],
    });
    if (created.id === undefined) throw new Error("Not added.");
    const placed = await server.placeSlot({
      blockId: landing.blockId,
      onDate: records.date,
      sortOrder,
      workItemId: created.id,
      tier: form.tier,
      lengthMin: form.lengthMin,
    });
    return {
      id: created.id,
      undo: [
        { kind: "token", token: created.undo },
        { kind: "token", token: placed.undo },
      ],
    };
  }
  const written = await server.writeBlockItem({
    blockId: landing.blockId,
    title: form.title,
    icon: form.icon,
    isTransition: false,
    atTime: form.pinned ? form.startsAt : null,
    lengthMin: form.lengthMin,
    meal: false,
    onDate: records.date,
    sortOrder,
  });
  if (written.id === undefined) throw new Error("Not added.");
  return { id: written.id, undo: [{ kind: "token", token: written.undo }] };
}

/**
 * Add's one way through (D-USE-11): with room the sheet's own write; with
 * none the room hook's `place`, and nothing written here.
 */
export function sendAdd<T>(
  plan: AddPlan,
  ways: {
    write: (landing: AddLanding, form: AddForm) => Promise<T>;
    place: (addition: RoomAddition) => Promise<void>;
  },
): Promise<T | void> {
  return plan.kind === "room"
    ? ways.place(plan.addition)
    : ways.write(plan.landing, plan.form);
}
