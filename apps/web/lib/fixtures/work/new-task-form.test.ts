import { describe, expect, it } from "vitest";
import { addChoices } from "@/components/work/add/choices";
import {
  actionWords,
  blockLine,
  canPick,
  canSave,
  emptyDraft,
  fitLine,
  pickSize,
  rangeWords,
  readWeekFit,
  toCreateTask,
  toggleDay,
  type NewTaskDraft,
} from "@/components/work/add/new-task/form";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { SET_UP_IDS, SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";

/** New task's form (USE-51) on the add scenario's week, 12 to 18 Oct. */

const [MON, TUE, WED, FRI, SAT, SUN] = [
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-16",
  "2026-10-17",
  "2026-10-18",
];

async function week(picked: string[], today = MON) {
  const server = createFixtureServer(
    resolveScenario("add-new-task"),
    () => new Date(SET_UP_NOW),
  );
  const records = await server.readWeek("2026-W42");
  return readWeekFit({
    days: records.days.map((day) => deriveSetUpDay(day, records.timeZone)),
    today,
    timeZone: records.timeZone,
    picked,
  });
}

function draft(change: Partial<NewTaskDraft>): NewTaskDraft {
  return {
    ...pickSize({ ...emptyDraft(), title: "[Pricing page]" }, "medium"),
    ...change,
  };
}

describe("the four, in order (C-USE-add-1)", () => {
  it("Task to a tier, From the pool, To-do, Event, naming the person", () => {
    const choices = addChoices("Taylor");
    expect(choices.map((c) => c.label)).toEqual([
      "Task to a tier",
      "From the pool",
      "To-do",
      "Event",
    ]);
    expect(choices[1]!.line).toBe(
      "Saved work, and Linear issues assigned to Taylor",
    );
  });

  it("the sheet's line names the day and block", () => {
    expect(
      blockLine(MON, { name: "Work", startsAt: "09:30", endsAt: "12:00" }),
    ).toBe("Mon 12 · Work, 9:30 to 12:00");
  });
});

describe("New task's fit line and action (C3)", () => {
  it("names each picked day's tier end in words, then the days with no Work block", async () => {
    const fit = await week([MON, WED]);
    const task = draft({ days: [MON, WED] });
    expect(fitLine(task, fit)).toBe(
      "Mon's Primary runs to 11:40 at the top of its ranges; Wed's to 11:10. Sat and Sun have no Work block.",
    );
    expect(actionWords(task)).toBe("Add to Primary, Mon and Wed");
  });

  it("past the block's end is said in words", async () => {
    const fit = await week([MON]);
    const task = draft({ days: [MON], lengthMinMin: 120, lengthMaxMin: 180 });
    expect(fitLine(task, fit)).toBe(
      "Mon's Primary runs to 12:40 at the top of its ranges: past Work's end at 12:00. Sat and Sun have no Work block.",
    );
  });

  it("with no days it waits in the pool, and the action says so (C4)", async () => {
    const fit = await week([]);
    const task = draft({ days: [] });
    expect(fitLine(task, fit)).toBe(
      "With no days it waits in the pool. It isn't sent to Linear; Synapse-only work stays here.",
    );
    expect(actionWords(task)).toBe("Save to the pool");
  });
});

describe("the day chips", () => {
  it("a day with no Work block can't be picked and says so in its name", async () => {
    const fit = await week([MON]);
    const byDate = new Map(fit.chips.map((chip) => [chip.dateKey, chip]));
    expect(fit.chips).toHaveLength(7);
    expect(canPick(byDate.get(SAT)!)).toBe(false);
    expect(canPick(byDate.get(SUN)!)).toBe(false);
    expect(canPick(byDate.get(FRI)!)).toBe(true);
    expect(byDate.get(SAT)!.name).toBe("Saturday 17, no Work block");
    expect(byDate.get(MON)!.name).toBe("Monday 12, selected");
    expect(byDate.get(TUE)!.name).toBe("Tuesday 13");
  });

  it("a day before today is no longer offered", async () => {
    const fit = await week([], WED);
    expect(canPick(fit.chips.find((c) => c.dateKey === MON)!)).toBe(false);
  });

  it("two days make one call: one item, a slot a day in that day's Work block", async () => {
    const fit = await week([MON, WED]);
    const task = toggleDay(toggleDay(draft({}), WED), MON);
    expect(task.days).toEqual([MON, WED]);
    expect(canSave(task, fit)).toBe(true);
    expect(toCreateTask(task, fit).days).toEqual([
      { dateKey: MON, blockId: SET_UP_IDS.blocks.work },
      { dateKey: WED, blockId: SET_UP_IDS.blocks.work },
    ]);
  });
});

describe("size words", () => {
  it("prints each default range as the boards do", () => {
    expect(rangeWords(15, 30)).toBe("15 to 30 min");
    expect(rangeWords(30, 60)).toBe("30 to 60 min");
    expect(rangeWords(60, 120)).toBe("1 to 2 h");
    expect(rangeWords(120, 240)).toBe("2 to 4 h");
    expect(rangeWords(240, null)).toBe("4 h or more");
    expect(rangeWords(45, 120)).toBe("45 min to 2 h");
  });
});
