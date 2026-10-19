import type {
  BlockChangeRecord,
  BlockItemRecord,
  BlockRecord,
  DayBoundsRecord,
  DayEventRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";
import type { PlannerRows } from "./planner-rows";

/** In-memory rows for the read tests (USE-91): one person's small week. */

export const TZ = "America/Vancouver";
export const STAMP = "2026-10-01T12:00:00.000Z";

let n = 0;
/** A fresh uuid-shaped id, readable in a failure: …0001, …0002. */
export function id(): string {
  n += 1;
  return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

const stamps = () => ({ id: id(), createdAt: STAMP, updatedAt: STAMP });

export const DAILY = "DTSTART;VALUE=DATE:20260101\nRRULE:FREQ=DAILY";
export const WEEKDAYS =
  "DTSTART;VALUE=DATE:20260105\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export function block(over: Partial<BlockRecord> = {}): BlockRecord {
  return {
    ...stamps(),
    kind: "morning",
    name: "Morning",
    icon: null,
    color: null,
    startsAt: "07:00",
    endsAt: "08:00",
    rrule: DAILY,
    onDate: null,
    fill: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...over,
  } as BlockRecord;
}

export function change(
  over: Partial<BlockChangeRecord> &
    Pick<BlockChangeRecord, "blockId" | "onDate">,
): BlockChangeRecord {
  return {
    ...stamps(),
    skipped: false,
    startsAt: null,
    endsAt: null,
    name: null,
    icon: null,
    color: null,
    ...over,
  };
}

export function item(
  over: Partial<BlockItemRecord> & Pick<BlockItemRecord, "blockId">,
): BlockItemRecord {
  return {
    ...stamps(),
    title: "Stretch",
    icon: null,
    isTransition: false,
    atTime: null,
    lengthMin: null,
    meal: false,
    onDate: null,
    sortOrder: 0,
    ...over,
  };
}

export function slot(
  over: Partial<SlotRecord> & Pick<SlotRecord, "blockId" | "onDate">,
): SlotRecord {
  return {
    ...stamps(),
    skipped: false,
    sortOrder: 0,
    blockItemId: null,
    todoId: null,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: null,
    doneAt: null,
    notes: null,
    atTime: null,
    icon: null,
    ...over,
  };
}

export function workItem(over: Partial<WorkItemRecord> = {}): WorkItemRecord {
  return {
    ...stamps(),
    title: "Write the brief",
    notes: null,
    icon: null,
    size: null,
    lengthMinMin: null,
    lengthMaxMin: null,
    dueOn: null,
    clientId: null,
    parentWorkItemId: null,
    doneAt: null,
    doneSource: null,
    archivedAt: null,
    linearIdentifier: null,
    linearConnectionId: null,
    linearIssueId: null,
    ...over,
  };
}

export function todo(over: Partial<TodoRecord> = {}): TodoRecord {
  return {
    ...stamps(),
    title: "Return the parcel",
    type: "errand",
    icon: null,
    lengthMin: 30,
    notes: null,
    onDate: null,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...over,
  } as TodoRecord;
}

export function event(over: Partial<DayEventRecord> = {}): DayEventRecord {
  return {
    ...stamps(),
    onDate: null,
    rrule: null,
    title: "Coffee with Sam",
    icon: null,
    startsAt: "11:00",
    endsAt: "11:30",
    tag: "personal",
    notes: null,
    color: null,
    clientId: null,
    ...over,
  } as DayEventRecord;
}

export function bounds(over: Partial<DayBoundsRecord> = {}): DayBoundsRecord {
  return {
    ...stamps(),
    weekday: null,
    onDate: null,
    upAt: "07:00",
    lightsOut: "22:30",
    ...over,
  };
}

export function rows(over: Partial<PlannerRows> = {}): PlannerRows {
  return {
    timeZone: TZ,
    dayCloseTime: "03:00",
    usualWakeTime: "07:00",
    blocks: [],
    blockChanges: [],
    blockItems: [],
    slots: [],
    slotEvents: [],
    workItems: [],
    clients: [],
    todos: [],
    dayEvents: [],
    dayRecords: [],
    dayBounds: [],
    googleSnapshots: [],
    googleCalendars: [],
    ...over,
  };
}
