import { describe, expect, it } from "vitest";
import { newBlockInput, newTransitionInput } from "@syn/validators";
import {
  colourLine,
  consequenceLine,
  lengthWords,
  newBlockWrite,
  openForm,
  reduceForm,
  repeatLabel,
  repeatOptions,
  scopeLine,
  type DayBlock,
  type NewBlockDay,
  type NewBlockForm,
} from "./form";

/**
 * USE-46's form module (`form.ts`), by criterion. The usual Monday is the
 * set-up week's: Wellness, Training with Workout: gym, Breakfast, Work, Lunch
 * and Work again; Monday's rule date is 12 October, Sunday's 18 October.
 */

const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function block(
  n: number,
  name: string,
  kind: string,
  startsAt: string,
  endsAt: string,
  items: DayBlock["items"] = [],
): DayBlock {
  return { id: id(n), name, kind, startsAt, endsAt, checklist: false, items };
}

const GYM = { id: id(21), title: "Workout: gym", atTime: null, lengthMin: 37 };

const MONDAY: NewBlockDay = {
  scope: { weekday: 0, date: null, ruleDate: "2026-10-12" },
  upAt: "07:00",
  blocks: [
    block(1, "Wellness", "wellness", "07:05", "08:00"),
    block(2, "Training", "training", "08:00", "08:57", [GYM]),
    block(3, "Breakfast", "break", "09:00", "09:30"),
    block(4, "Work", "work", "09:30", "12:00"),
    block(5, "Lunch", "break", "12:00", "13:00"),
    block(6, "Work", "work", "13:00", "15:00"),
  ],
};

const THIS_MONDAY: NewBlockDay = {
  ...MONDAY,
  scope: { weekday: 0, date: "2026-10-12", ruleDate: "2026-10-12" },
};

const stretch = (): NewBlockForm =>
  reduceForm(
    openForm(
      { mode: "block", startsAt: "17:00", endsAt: "17:20", kind: "training" },
      MONDAY.scope,
    ),
    { type: "name", name: "Stretch" },
  );

describe("C12: the name follows the kind until typed over", () => {
  it("fills the kind's name on open and on each pick while untouched", () => {
    const form = openForm({ mode: "block", startsAt: "07:05" }, MONDAY.scope);
    expect(form.kind).toBe("wellness");
    expect(form.name).toBe("Wellness");
    expect(reduceForm(form, { type: "kind", kind: "todos" }).name).toBe(
      "To-dos",
    );
  });

  it("keeps a typed name when the kind changes, and the colour follows", () => {
    const typed = reduceForm(stretch(), { type: "kind", kind: "work" });
    expect(typed.name).toBe("Stretch");
    expect(colourLine(typed, MONDAY).text).toBe("Sky, Work's colour");
    expect(colourLine(stretch(), MONDAY).text).toBe("Clay, Training's colour");
    const wellness = reduceForm(stretch(), { type: "kind", kind: "wellness" });
    expect(colourLine(wellness, MONDAY).text).toBe("Leaf, Wellness's colour");
  });

  it("refills when cleared and a kind is picked", () => {
    const cleared = reduceForm(stretch(), { type: "name", name: "" });
    expect(cleared.nameCleared).toBe(true);
    const refilled = reduceForm(cleared, { type: "kind", kind: "life" });
    expect(refilled.name).toBe("Life");
    expect(refilled.nameCleared).toBe(false);
  });

  it("an emptied name reads the invalid line", () => {
    const cleared = reduceForm(stretch(), { type: "name", name: "" });
    expect(consequenceLine(cleared, MONDAY, false)).toEqual({
      kind: "invalid",
      tone: "muted",
      text: "A block needs a name. The kind's name fills in when a kind is picked; this one was cleared.",
    });
  });
});

describe("C12: Ends sets the length", () => {
  it("reads the length beside Ends", () => {
    expect(lengthWords(20)).toBe("20 min");
    expect(lengthWords(60)).toBe("1 h");
    expect(lengthWords(180)).toBe("3 h");
    expect(lengthWords(90)).toBe("1 h 30 min");
    expect(lengthWords(0)).toBe("");
  });

  it("Ends changes the length; Starts moves Ends with it", () => {
    const longer = reduceForm(stretch(), { type: "ends", endsAt: "18:00" });
    expect(longer.endsAt).toBe("18:00");
    const moved = reduceForm(stretch(), { type: "starts", startsAt: "16:00" });
    expect(moved).toMatchObject({ startsAt: "16:00", endsAt: "16:20" });
  });

  it("a block opens an hour long, a transition 15 minutes", () => {
    expect(
      openForm({ mode: "block", startsAt: "07:05" }, MONDAY.scope).endsAt,
    ).toBe("08:05");
    expect(
      openForm({ mode: "transition", startsAt: "08:00" }, MONDAY.scope).endsAt,
    ).toBe("08:15");
  });
});

describe("C12: Repeats defaults by week (D-USE-80)", () => {
  it("weekly on its day from the usual week", () => {
    const form = stretch();
    expect(form.repeat).toBe("weekly");
    expect(repeatLabel(form, MONDAY.scope.ruleDate)).toBe("Weekly on Monday");
  });

  it("does not repeat from This week", () => {
    const form = openForm(
      { mode: "block", startsAt: "13:00", kind: "work" },
      THIS_MONDAY.scope,
    );
    expect(form.repeat).toBe("none");
    expect(scopeLine(form, THIS_MONDAY)).toBe("Mon 12 · this date only");
  });

  it("words Google's presets from Sunday 18 October (C8)", () => {
    expect(repeatOptions("2026-10-18").map((o) => o.label)).toEqual([
      "Does not repeat",
      "Daily",
      "Weekly on Sunday",
      "Monthly on the third Sunday",
      "Annually on 18 October",
      "Every weekday, Monday to Friday",
    ]);
  });

  it("stores one rule, not a copy per day", () => {
    const write = newBlockWrite(stretch(), MONDAY);
    expect(write.method).toBe("createBlock");
    if (write.method !== "createBlock") return;
    expect(write.input).toMatchObject({
      kind: "training",
      name: "Stretch",
      startsAt: "17:00",
      endsAt: "17:20",
      rrule: "DTSTART;VALUE=DATE:20261012\nRRULE:FREQ=WEEKLY;BYDAY=MO",
      onDate: null,
      fill: "set_items",
    });
    expect(newBlockInput.safeParse(write.input).success).toBe(true);
  });
});

describe("C12: a transition's time inside a block places it in_block", () => {
  const transition = reduceForm(
    openForm({ mode: "transition", startsAt: "08:00" }, MONDAY.scope),
    { type: "name", name: "Drive to the YMCA" },
  );

  it("goes inside Training, asking nothing, and names what moves (C6)", () => {
    expect(scopeLine(transition, MONDAY)).toBe(
      "Usual Monday · inside Training",
    );
    expect(colourLine(transition, MONDAY).text).toBe("Takes Training's colour");
    expect(consequenceLine(transition, MONDAY, false).text).toBe(
      "8:00 falls in Training, so it goes inside Training. Workout: gym moves to 8:15.",
    );
  });

  it("writes an in_block item before Workout: gym", () => {
    const write = newBlockWrite(transition, MONDAY);
    expect(write.method).toBe("createTransition");
    if (write.method !== "createTransition") return;
    expect(write.input).toEqual({
      placement: "in_block",
      blockId: id(2),
      name: "Drive to the YMCA",
      icon: null,
      atTime: "08:00",
      lengthMin: 15,
      meal: false,
      sortOrder: 0,
    });
    expect(write.order).toEqual({ blockId: id(2), ids: [null, id(21)] });
    expect(newTransitionInput.safeParse(write.input).success).toBe(true);
  });

  it("outside every block, it stands between blocks", () => {
    const between = reduceForm(transition, {
      type: "starts",
      startsAt: "15:00",
    });
    expect(newBlockWrite(between, MONDAY).input).toMatchObject({
      placement: "between_blocks",
    });
  });
});

describe("the consequence line", () => {
  it("names the day, the span and what it goes after (C1)", () => {
    expect(scopeLine(stretch(), MONDAY)).toBe("Usual Monday · every week");
    expect(consequenceLine(stretch(), MONDAY, false).text).toBe(
      "Goes in on Mondays, 17:00 to 17:20, after Work. Opens empty to add its items.",
    );
  });

  it("a clash is a line in ink and nothing more (C9)", () => {
    const clash = reduceForm(stretch(), { type: "starts", startsAt: "11:30" });
    expect(consequenceLine(clash, MONDAY, false)).toEqual({
      kind: "clash",
      tone: "ink",
      text: "Overlaps Work, 9:30 to 12:00. Adding still works: the two sit side by side, and Work keeps its time.",
    });
  });

  it("an error outranks it and keeps the form (C11)", () => {
    expect(consequenceLine(stretch(), MONDAY, true)).toEqual({
      kind: "error",
      tone: "ink",
      text: "Not added.",
    });
  });

  it("To-dos sends what isn't done back (C4)", () => {
    const sunday: NewBlockDay = {
      scope: { weekday: 6, date: null, ruleDate: "2026-10-18" },
      upAt: null,
      blocks: [],
    };
    const form = openForm(
      { mode: "block", startsAt: "13:00", endsAt: "16:00", kind: "todos" },
      sunday.scope,
    );
    expect(colourLine(form, sunday).text).toBe("Moss, To-dos' colour");
    expect(consequenceLine(form, sunday, false).text).toBe(
      "Goes in on Sundays, 13:00 to 16:00. What isn't done by 16:00 goes back to To-dos.",
    );
    expect(newBlockWrite(form, sunday).input).toMatchObject({
      fill: "from_todos",
    });
  });

  it("a checklist names the All day strip and runs the whole date (C5)", () => {
    const form = reduceForm(stretch(), { type: "checklist", on: true });
    expect(consequenceLine(form, MONDAY, false).text).toBe(
      "Goes in on Mondays in the All day strip, above the rail. Set a time later to put it on the rail.",
    );
    expect(newBlockWrite(form, MONDAY).input).toMatchObject({
      startsAt: "00:00",
      endsAt: "24:00",
      checklist: true,
    });
  });

  it("Work from This week opens on its tiers (C3)", () => {
    const day: NewBlockDay = {
      ...THIS_MONDAY,
      blocks: THIS_MONDAY.blocks.filter((b) => b.id !== id(6)),
    };
    const form = openForm(
      { mode: "block", startsAt: "13:00", endsAt: "15:00", kind: "work" },
      day.scope,
    );
    expect(consequenceLine(form, day, false).text).toBe(
      "Goes in after Lunch, 13:00 to 15:00, and opens on its tiers to add work.",
    );
    expect(newBlockWrite(form, day).input).toMatchObject({
      rrule: null,
      onDate: "2026-10-12",
      fill: "tasks_for_the_day",
    });
  });

  it("an empty usual day reads Every <Weekday> and goes after Orient (C2)", () => {
    const thursday: NewBlockDay = {
      scope: { weekday: 3, date: null, ruleDate: "2026-10-15" },
      upAt: "07:00",
      blocks: [],
    };
    const form = openForm(
      { mode: "block", startsAt: "07:05", kind: "wellness" },
      thursday.scope,
    );
    expect(scopeLine(form, thursday)).toBe("Every Thursday");
    expect(consequenceLine(form, thursday, false).text).toBe(
      "Goes in on Thursdays, 7:05 to 8:05, after Orient. Opens empty to add its items.",
    );
  });
});
