import { describe, expect, it } from "vitest";
import {
  blockChangeInput,
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  dayEventRecord,
  dayRecordRecord,
  mealTopicRecord,
  newBlockInput,
  newTransitionInput,
  placeSlotInput,
  savedColourRecord,
  slotEventInput,
  slotEventRecord,
  slotRecord,
} from "./planner";
import { todoRecord } from "./todo";
import { clientRecord, workItemInput, workItemRecord } from "./work";

/** USE-3's criteria, one `describe` each (the contract's C1 to C6). */

const ID = "5b0f7d0e-3c1a-4f7b-9a3e-0d6c2b1e8f40";
const ID2 = "9c2e4a61-7b3d-4e8f-a1c5-2f6d8b0e4a73";
const AT = "2026-10-13T08:00:00.000Z";
const RRULE = "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;BYDAY=MO";

const block = {
  name: "Stretch",
  startsAt: "17:00",
  endsAt: "17:20",
  rrule: RRULE,
};

function without<T extends object>(value: T, key: keyof T): Partial<T> {
  const copy: Partial<T> = { ...value };
  delete copy[key];
  return copy;
}

function messages(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) {
  return result.success
    ? []
    : (result.error?.issues ?? []).map((issue) => issue.message);
}

describe("C1: new block kinds, and the transition's two places", () => {
  it.each([
    "wellness",
    "training",
    "work",
    "life",
    "todos",
    "break",
    "evening",
  ])("accepts %s", (kind) => {
    expect(newBlockInput.safeParse({ ...block, kind }).success).toBe(true);
  });

  it.each(["orient", "morning", "prep", "activity", "wind_down", "transition"])(
    "refuses %s",
    (kind) => {
      expect(newBlockInput.safeParse({ ...block, kind }).success).toBe(false);
    },
  );

  const inBlock = {
    placement: "in_block",
    blockId: ID,
    name: "Drive to the YMCA",
    atTime: "08:00",
    lengthMin: 15,
    sortOrder: 2,
  };

  it("inside a block takes a start and a length", () => {
    expect(newTransitionInput.safeParse(inBlock).success).toBe(true);
    expect(
      newTransitionInput.safeParse(without(inBlock, "lengthMin")).success,
    ).toBe(false);
    expect(
      newTransitionInput.safeParse(without(inBlock, "atTime")).success,
    ).toBe(false);
  });

  it("inside a block takes no repeat and no date", () => {
    expect(
      newTransitionInput.safeParse({ ...inBlock, rrule: RRULE }).success,
    ).toBe(false);
    expect(
      newTransitionInput.safeParse({ ...inBlock, onDate: "2026-10-13" })
        .success,
    ).toBe(false);
  });

  it("takes no kind in either place", () => {
    expect(
      newTransitionInput.safeParse({ ...inBlock, kind: "training" }).success,
    ).toBe(false);
    expect(
      newTransitionInput.safeParse({
        placement: "between_blocks",
        ...block,
        kind: "transition",
      }).success,
    ).toBe(false);
  });

  it("outside every block chooses its own rule or date, like a block", () => {
    const between = { placement: "between_blocks", ...block };
    expect(newTransitionInput.safeParse(between).success).toBe(true);
    expect(
      newTransitionInput.safeParse({
        ...between,
        rrule: null,
        onDate: "2026-10-13",
      }).success,
    ).toBe(true);
    expect(
      newTransitionInput.safeParse({ ...between, rrule: undefined }).success,
    ).toBe(false);
    expect(
      newTransitionInput.safeParse({ ...between, onDate: "2026-10-13" })
        .success,
    ).toBe(false);
  });
});

describe("C2: a block's repeat, span and name; a block change", () => {
  const work = { ...block, kind: "work" };

  it("needs exactly one of rrule and on_date", () => {
    expect(
      newBlockInput.safeParse({ ...work, rrule: null, onDate: "2026-10-13" })
        .success,
    ).toBe(true);
    expect(newBlockInput.safeParse({ ...work, rrule: null }).success).toBe(
      false,
    );
    expect(
      newBlockInput.safeParse({ ...work, onDate: "2026-10-13" }).success,
    ).toBe(false);
  });

  it("checks the rule's shape: both lines, FREQ, known parts", () => {
    for (const rrule of [
      "RRULE:FREQ=WEEKLY",
      "DTSTART;VALUE=DATE:20261012\nFREQ=WEEKLY",
      "DTSTART;VALUE=DATE:20261012\nRRULE:BYDAY=MO",
      "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=HOURLY",
      "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;BOGUS=1",
      "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;FREQ=DAILY",
    ]) {
      expect(newBlockInput.safeParse({ ...work, rrule }).success, rrule).toBe(
        false,
      );
    }
    expect(
      newBlockInput.safeParse({
        ...work,
        rrule:
          "DTSTART;VALUE=DATE:20261012\r\nRRULE:FREQ=MONTHLY;INTERVAL=2;BYDAY=2TU;COUNT=6",
      }).success,
    ).toBe(true);
  });

  it("needs an end after its start, with 24:00 an end and never a start", () => {
    expect(
      newBlockInput.safeParse({ ...work, startsAt: "17:20", endsAt: "17:20" })
        .success,
    ).toBe(false);
    expect(
      newBlockInput.safeParse({ ...work, startsAt: "18:00", endsAt: "17:00" })
        .success,
    ).toBe(false);
    const midnight = newBlockInput.safeParse({
      ...work,
      startsAt: "21:00",
      endsAt: "24:00",
    });
    expect(midnight.success && midnight.data.endsAt).toBe("24:00");
    expect(
      newBlockInput.safeParse({ ...work, startsAt: "24:00", endsAt: "24:00" })
        .success,
    ).toBe(false);
  });

  it('refuses a missing or empty name with "Name needed"', () => {
    expect(
      messages(newBlockInput.safeParse({ ...work, name: "  " })),
    ).toContain("Name needed");
    expect(messages(newBlockInput.safeParse(without(work, "name")))).toContain(
      "Name needed",
    );
  });

  it("a block change is skipped or carries both times", () => {
    const change = { blockId: ID, onDate: "2026-10-13" };
    expect(
      blockChangeInput.safeParse({ ...change, skipped: true }).success,
    ).toBe(true);
    expect(
      blockChangeInput.safeParse({
        ...change,
        startsAt: "09:00",
        endsAt: "10:00",
      }).success,
    ).toBe(true);
    expect(
      blockChangeInput.safeParse({ ...change, startsAt: "09:00" }).success,
    ).toBe(false);
    expect(blockChangeInput.safeParse(change).success).toBe(false);
    expect(
      blockChangeInput.safeParse({
        ...change,
        startsAt: "10:00",
        endsAt: "09:00",
      }).success,
    ).toBe(false);
  });
});

describe("C3: a slot's one target, and a tier only with a work item", () => {
  const slot = { blockId: ID, onDate: "2026-10-13", sortOrder: 0 };

  it("needs exactly one of a block item, a to-do and a work item", () => {
    expect(placeSlotInput.safeParse({ ...slot, todoId: ID2 }).success).toBe(
      true,
    );
    expect(
      placeSlotInput.safeParse({ ...slot, blockItemId: ID2 }).success,
    ).toBe(true);
    expect(placeSlotInput.safeParse({ ...slot, workItemId: ID2 }).success).toBe(
      true,
    );
    expect(placeSlotInput.safeParse(slot).success).toBe(false);
    expect(
      placeSlotInput.safeParse({ ...slot, todoId: ID2, workItemId: ID2 })
        .success,
    ).toBe(false);
  });

  it("takes a tier only with a work item", () => {
    expect(
      placeSlotInput.safeParse({ ...slot, workItemId: ID2, tier: "primary" })
        .success,
    ).toBe(true);
    expect(
      placeSlotInput.safeParse({ ...slot, todoId: ID2, tier: "primary" })
        .success,
    ).toBe(false);
  });
});

describe("C4: a slot event's kind, client_event_id and step_away_id", () => {
  const event = { slotId: ID, clientEventId: ID2, at: AT };

  it.each([
    "started",
    "paused",
    "resumed",
    "prompt_sent",
    "brought_back",
    "done",
    "undone",
    "day_closed",
  ])("accepts %s", (kind) => {
    expect(slotEventInput.safeParse({ ...event, kind }).success).toBe(true);
  });

  it("refuses another kind, and a client_event_id that is not a uuid", () => {
    expect(
      slotEventInput.safeParse({ ...event, kind: "skipped" }).success,
    ).toBe(false);
    expect(
      slotEventInput.safeParse({
        ...event,
        kind: "started",
        clientEventId: "evt-1",
      }).success,
    ).toBe(false);
    expect(
      slotEventInput.safeParse({
        ...without(event, "clientEventId"),
        kind: "started",
      }).success,
    ).toBe(false);
  });

  it("takes a step_away_id only on paused or resumed", () => {
    expect(
      slotEventInput.safeParse({ ...event, kind: "paused", stepAwayId: ID })
        .success,
    ).toBe(true);
    expect(
      slotEventInput.safeParse({ ...event, kind: "resumed", stepAwayId: ID })
        .success,
    ).toBe(true);
    expect(
      slotEventInput.safeParse({ ...event, kind: "done", stepAwayId: ID })
        .success,
    ).toBe(false);
  });
});

describe("C5: a work item's length range and size; a client's colour", () => {
  it("refuses a minimum above its maximum", () => {
    const item = { title: "Invoice run" };
    expect(
      workItemInput.safeParse({ ...item, lengthMinMin: 30, lengthMaxMin: 60 })
        .success,
    ).toBe(true);
    expect(
      workItemInput.safeParse({ ...item, lengthMinMin: 30, lengthMaxMin: 30 })
        .success,
    ).toBe(true);
    expect(
      workItemInput.safeParse({ ...item, lengthMinMin: 90, lengthMaxMin: 60 })
        .success,
    ).toBe(false);
  });

  it("takes one of the five sizes, or none", () => {
    for (const size of [
      "quick",
      "small",
      "medium",
      "large",
      "huge",
      null,
      undefined,
    ]) {
      expect(
        workItemInput.safeParse({ title: "Invoice run", size }).success,
      ).toBe(true);
    }
    expect(
      workItemInput.safeParse({ title: "Invoice run", size: "tiny" }).success,
    ).toBe(false);
  });

  it("takes a client colour of rose, leaf, amber, moss, slate or ink", () => {
    const client = { ...clientRow };
    for (const colorKey of ["rose", "leaf", "amber", "moss", "slate", "ink"]) {
      expect(clientRecord.safeParse({ ...client, colorKey }).success).toBe(
        true,
      );
    }
    expect(clientRecord.safeParse({ ...client, colorKey: "sky" }).success).toBe(
      false,
    );
  });
});

/* Sample rows, camelCase as a router returns them; times as Postgres sends them. */
const stamps = { id: ID, createdAt: AT, updatedAt: AT };
const clientRow = {
  ...stamps,
  name: "Northwind",
  colorKey: "moss",
  logoPath: null,
  sortOrder: 0,
  archivedAt: null,
};

const samples = {
  blockRecord: [
    blockRecord,
    {
      ...stamps,
      kind: "training",
      name: "Training",
      icon: { kind: "lucide", value: "dumbbell", color: "clay" },
      color: null,
      startsAt: "07:00:00",
      endsAt: "24:00:00",
      rrule: RRULE,
      onDate: null,
      fill: null,
      checklist: true,
      meal: false,
      notify: false,
      archivedAt: null,
    },
  ],
  blockChangeRecord: [
    blockChangeRecord,
    {
      ...stamps,
      blockId: ID2,
      onDate: "2026-10-13",
      skipped: true,
      startsAt: null,
      endsAt: null,
    },
  ],
  blockItemRecord: [
    blockItemRecord,
    {
      ...stamps,
      blockId: ID2,
      title: "Drive to the YMCA",
      icon: { kind: "emoji", value: "🚗" },
      isTransition: true,
      atTime: "08:00:00",
      lengthMin: 15,
      meal: false,
      sortOrder: 1,
    },
  ],
  todoRecord: [
    todoRecord,
    {
      ...stamps,
      title: "Call the dentist",
      type: "call",
      icon: null,
      lengthMin: 10,
      notes: "Ask about Thursday.",
      onDate: "2026-10-14",
      rrule: null,
      remindAt: "09:30:00",
      doneAt: null,
      archivedAt: null,
    },
  ],
  slotRecord: [
    slotRecord,
    {
      ...stamps,
      blockId: ID2,
      onDate: "2026-10-13",
      sortOrder: 0,
      blockItemId: null,
      todoId: null,
      workItemId: ID2,
      tier: "urgent",
      lengthMin: 45,
      tookMin: 0,
      doneAt: null,
    },
  ],
  slotEventRecord: [
    slotEventRecord,
    {
      id: ID,
      createdAt: AT,
      slotId: ID2,
      kind: "paused",
      clientEventId: ID2,
      at: AT,
      receivedAt: "2026-10-13T08:00:01+00:00",
      stepAwayId: ID,
    },
  ],
  dayEventRecord: [
    dayEventRecord,
    {
      ...stamps,
      onDate: "2026-10-13",
      title: "Dentist",
      icon: null,
      startsAt: "14:00:00",
      endsAt: "14:30:00",
    },
  ],
  dayRecordRecord: [
    dayRecordRecord,
    {
      ...stamps,
      onDate: "2026-10-13",
      orientedAt: AT,
      readyAt: null,
      closedAt: null,
    },
  ],
  mealTopicRecord: [
    mealTopicRecord,
    {
      ...stamps,
      name: "Cooking",
      icon: null,
      linkKind: "channel",
      linkValue: "https://www.youtube.com/@example",
      sortOrder: 0,
    },
  ],
  savedColourRecord: [
    savedColourRecord,
    { ...stamps, hex: "#a1b2c3", sortOrder: 0 },
  ],
  workItemRecord: [
    workItemRecord,
    {
      ...stamps,
      title: "Invoice run",
      notes: null,
      icon: null,
      size: "small",
      lengthMinMin: 30,
      lengthMaxMin: 60,
      dueOn: "2026-10-20",
      clientId: ID2,
      parentWorkItemId: null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: null,
    },
  ],
  clientRecord: [clientRecord, clientRow],
} as const;

describe("C6: every record parses a sample row and drops a key it does not know", () => {
  it.each(Object.entries(samples))("%s", (_name, [schema, row]) => {
    const parsed = schema.parse({ ...row, userId: ID, renamedColumn: 1 });
    expect(parsed).not.toHaveProperty("userId");
    expect(parsed).not.toHaveProperty("renamedColumn");
  });

  it("returns times as HH:MM", () => {
    const parsed = blockRecord.parse(samples.blockRecord[1]);
    expect([parsed.startsAt, parsed.endsAt]).toEqual(["07:00", "24:00"]);
  });

  it("fails on a missing column rather than passing", () => {
    const renamed = {
      ...without(samples.blockRecord[1], "name"),
      title: "Training",
    };
    expect(blockRecord.safeParse(renamed).success).toBe(false);
  });
});
