import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  TODAY_DESK_NOW,
  TODAY_NOT_WORK_NOW,
  TODAY_WORK_IDS,
} from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue, subIssuesOf } from "./integration-records";
import { deriveTodayWork, todayTodos } from "./today-work";
import { deriveTray } from "./use-todos";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-57: work's Today read from its scenarios as the screen reads them. Next
 * is `resolveWorkNext`'s, the rows in tier order, the firing row in its place
 * with whole minutes (C-USE-today-3, C-USE-today-working-1).
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

async function read(name: string, at: string) {
  const now = new Date(at);
  const scenario = resolveScenario(name);
  const server = createFixtureServer(scenario, () => now);
  const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
  const view = deriveWeekView({
    weekKey: weekKeyOf(MONDAY),
    week,
    // The pool lends the sessions past this week; the screen reads it.
    pool: null,
    todayKey: MONDAY,
  });
  const today = deriveToday(await server.readToday(MONDAY));
  const linear = await server.readLinear();
  const clients = scenario.records.clients;
  const work = deriveTodayWork({
    today,
    day: view.days.find((day) => day.dateKey === MONDAY) ?? null,
    now,
    clientFor: (item) =>
      clients.find((client) => client.id === item.clientId) ?? null,
    issueFor: (item) => joinIssue(linear, item),
    subIssuesFor: (item) => subIssuesOf(linear, item),
  });
  const tray = deriveTray(await server.readTodos(MONDAY), now);
  return { work, todos: todayTodos(tray, today.records.todos) };
}

describe("work's Today, working (C1, C2)", () => {
  it("draws the tiers in order, one firing in place and Next lifted", async () => {
    const { work } = await read("today-working", TODAY_DESK_NOW);
    expect(work.title).toBe("Monday, 12 October");
    expect(work.time).toBe("10:20");
    expect(work.band).toMatchObject({
      name: "Work",
      isWork: true,
      detail: "9:30 to 12:00 · [Kestrel weekly] at 11:00, in 40 min",
      headerDetail: "9:30 to 12:00 · [Kestrel weekly] at 11:00",
    });
    expect(
      work.tiers.map((group) => [group.word, group.rows.map((row) => row.id)]),
    ).toEqual([
      ["Primary", [S.portal, S.alder]],
      ["Secondary", [S.sms, S.desk]],
      ["Stretch", [S.invoice]],
    ]);
    const [portal, alder] = work.tiers[0]!.rows;
    // Firing stays in its tier and place, in whole minutes.
    expect(portal).toMatchObject({
      form: "firing",
      firing: { word: "firing", time: "4 min" },
      worked: null,
    });
    // Next is the first neither firing nor done, lifted with nothing in hand.
    expect(work.next).toEqual({ kind: "slot", slotId: S.alder });
    expect(alder).toMatchObject({ form: "next", session: "session 1 of 3" });
    expect(work.nextRow).toMatchObject({ id: S.alder, tierWord: "Primary" });
    expect(work.lift).toBe(true);
    expect(work.whileItFires).toMatchObject({
      rowId: S.portal,
      lead: "While it fires:",
      title: "Kegels",
      meta: "daily",
    });
  });

  it("prints the locked row anatomy from Linear and the clients", async () => {
    const { work } = await read("today-working", TODAY_DESK_NOW);
    const desk = work.tiers[1]!.rows[1]!;
    expect(desk).toMatchObject({
      identifier: "SYN-212",
      subIssues: { summary: "2 sub-issues · 1 done" },
    });
    expect(work.tiers[2]!.rows[0]).toMatchObject({
      noLinear: "No Linear",
      identifier: null,
    });
  });

  it("lists the To-dos with their repeat and time", async () => {
    const { todos } = await read("today-working", TODAY_DESK_NOW);
    expect(
      todos.map(({ title, checked, meta }) => ({ title, checked, meta })),
    ).toEqual(
      expect.arrayContaining([
        { title: "Kegels", checked: false, meta: "daily · 14:00" },
        {
          title: "Hip and hamstring stretch",
          checked: true,
          meta: "daily · 10:00",
        },
      ]),
    );
  });
});

describe("outside a Work block (C4)", () => {
  it("names the current block; the tiers stay, Next a shaded row", async () => {
    const { work } = await read("today-not-work", TODAY_NOT_WORK_NOW);
    expect(work.band).toMatchObject({
      name: "Training",
      isWork: false,
      detail: "8:00 to 8:57 · Work starts at 9:30",
    });
    expect(work.tiers.map((group) => group.word)).toEqual([
      "Primary",
      "Secondary",
      "Stretch",
    ]);
    expect(work.next).toEqual({ kind: "slot", slotId: S.portal });
    expect(work.lift).toBe(false);
    expect(work.whileItFires).toBeNull();
  });
});
