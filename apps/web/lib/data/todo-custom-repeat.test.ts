import { describe, expect, it } from "vitest";
import { parseRule, todoRepeatOptions, type RuleForm } from "@syn/utils";
import { TODO_SHEET_COPY as COPY } from "@/components/planner/todo-sheet/copy";
import {
  customRepeatForm,
  customRepeatLabel,
  customRepeatWrite,
} from "@/components/planner/todo-sheet/fields";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { TODO_SHEET_IDS } from "@/lib/fixtures/scenarios/todo-sheet";
import { createFixtureServer } from "@/lib/fixtures/server";

/**
 * C3 (USE-110; todo-sheet/states/repeats-open.md): the To-do sheet's
 * Repeats ends with Custom…, which opens USE-47's custom step on the
 * to-do's rule (or every week on its day) and stores one RFC 5545 rule on
 * the to-do through `updateTodo`'s `rrule`, as a block does (D-USE-80).
 */

const ID = TODO_SHEET_IDS.mechanic;

function setup() {
  const scenario = resolveScenario("todo-repeats-custom");
  const server = createFixtureServer(scenario, () => new Date(scenario.now));
  const stored = async () =>
    (await server.readTodos(BASE_DATE)).todos.find((todo) => todo.id === ID)!;
  return { scenario, server, stored };
}

/** Every two weeks on Monday and Thursday, five times. */
const FORTNIGHTLY: RuleForm = {
  every: 2,
  unit: "week",
  weekdays: [0, 3],
  monthBy: null,
  ends: { kind: "after", count: 5 },
};

describe("C3: Repeats › Custom… on the To-do sheet", () => {
  it("lists Custom… after the presets, and the scenario opens its step", () => {
    const { scenario } = setup();
    expect(scenario.view?.open).toBe("todo-custom");
    expect(todoRepeatOptions(BASE_DATE).map((option) => option.label)).toEqual([
      "Does not repeat",
      "Every day",
      "Every week, on Monday",
      "Every month, on the 12th",
    ]);
    expect(COPY.custom).toBe("Custom…");
  });

  it("opens on every week on the to-do's day when it has no rule", () => {
    expect(customRepeatForm(null, BASE_DATE)).toMatchObject({
      every: 1,
      unit: "week",
      weekdays: [0],
      ends: { kind: "never" },
    });
  });

  it("Done stores one rule on the to-do, read back as set", async () => {
    const { server, stored } = setup();
    const before = await stored();
    expect(before.rrule).toBeNull();

    const patch = customRepeatWrite(FORTNIGHTLY, BASE_DATE, before);
    expect(patch).not.toBeNull();
    await server.updateTodo({ id: ID, patch: patch! });

    const after = await stored();
    expect(after.rrule).toBe(patch!.rrule);
    const parsed = parseRule(after.rrule!);
    expect(parsed.ok).toBe(true);
    // One rule, its DTSTART the to-do's day, as a block's (D-USE-80).
    expect(after.rrule).toMatch(/^DTSTART;VALUE=DATE:20261012\nRRULE:/);
    expect(after.rrule).toContain("FREQ=WEEKLY");
    expect(after.rrule).toContain("INTERVAL=2");
    expect(after.rrule).toContain("COUNT=5");

    // Custom… opens again on what is set, and Done unchanged writes nothing.
    expect(customRepeatForm(after.rrule, BASE_DATE)).toEqual(FORTNIGHTLY);
    expect(customRepeatWrite(FORTNIGHTLY, BASE_DATE, after)).toBeNull();
    // The trigger reads the rule in words, never "Custom".
    expect(customRepeatLabel(after.rrule!, COPY.customRepeat)).not.toBe(
      COPY.customRepeat,
    );
  });
});
