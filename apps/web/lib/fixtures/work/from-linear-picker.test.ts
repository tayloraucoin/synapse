import { describe, expect, it } from "vitest";
import { readWeekFit } from "@/components/work/add/new-task/form";
import {
  DEFAULT_FILTERS,
  derivePicker,
  type PickerFilters,
  type PickerView,
} from "@/components/work/from-linear/picker-view";
import { deriveSetUpDay } from "@/lib/data/use-set-up-day";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { FROM_LINEAR_IDS } from "@/lib/fixtures/scenarios/from-linear";
import { SET_UP_NOW } from "@/lib/fixtures/scenarios/set-up";
import { createFixtureServer } from "@/lib/fixtures/server";

/** C1's words (USE-52): the picker as From Linear on Mon 12's Primary draws it. */

const { monday: MON, work: WORK } = FROM_LINEAR_IDS;

async function view(
  ticked: readonly string[],
  filters: Partial<PickerFilters> = {},
): Promise<PickerView> {
  const server = createFixtureServer(
    resolveScenario("from-linear-by-size"),
    () => new Date(SET_UP_NOW),
  );
  const [linear, connections, week] = await Promise.all([
    server.readLinear(),
    server.readConnections(),
    server.readWeek("2026-W42"),
  ]);
  const days = week.days.map((d) => deriveSetUpDay(d, week.timeZone));
  const fit = readWeekFit({
    days,
    today: "2026-10-11",
    timeZone: week.timeZone,
    picked: [],
    blockId: WORK,
  });
  return derivePicker({
    linear,
    connections,
    day: days.find((d) => d.date === MON),
    fit: fit.days.get(MON),
    blockName: "Work",
    dateKey: MON,
    tier: "primary",
    timeZone: week.timeZone,
    filters: { ...DEFAULT_FILTERS, ...filters },
    ticked,
    personName: "Taylor",
  });
}

const rows = (v: PickerView) =>
  v.groups.flatMap((g) => g.lines.flatMap((l) => l.rows));
const row = (v: PickerView, identifier: string) =>
  rows(v).find((r) => r.identifier === identifier)!;

describe("C1: From Linear for Mon 12's Primary", () => {
  it("names the scope and the action", async () => {
    const v = await view([]);
    expect(v.context).toBe("Mon 12 · Work · Add to Primary");
    expect(v.action).toBe("Add to Primary");
  });

  it("each row shows its project, ID and length range, and its points word", async () => {
    const v = await view([]);
    expect(row(v, "ENG-151")).toMatchObject({
      meta: "Sync engine · ENG-151 · 30 min to 1 h",
      sizeWord: "2 Small",
      placed: false,
    });
    expect(row(v, "ENG-142")).toMatchObject({
      meta: "Sync engine · ENG-142 · 1 to 2 h",
      sizeWord: "3 Medium",
    });
    expect(row(v, "BIZ-9").sizeWord).toBe("1 Quick");
    // No estimate: 30 min.
    expect(row(v, "SYN-224").meta).toBe("Synapse · SYN-224 · 30 min");
  });

  it("fades an issue already on Mon 12, naming its day and tier (C-USE-add-from-linear-by-size-2)", async () => {
    const v = await view([FROM_LINEAR_IDS.syncSpec]);
    expect(row(v, "ENG-123")).toMatchObject({
      placed: true,
      ticked: false,
      meta: "ENG-123 · already on Mon 12, in Primary",
    });
    expect(row(v, "ENG-140").meta).toBe(
      "ENG-140 · already on Mon 12, in Secondary",
    );
    // A placed row never counts as ticked.
    expect(v.ticked).toEqual([]);
    expect(v.line).toBeNull();
  });

  it("groups by client in the one order, with team and project lines", async () => {
    const v = await view([]);
    expect(v.groups.map((g) => g.head?.name)).toEqual([
      "Lighthouse",
      "Kestrel",
      "Alder",
      "No client",
    ]);
    const kestrel = v.groups[1]!;
    expect(kestrel.lines.map((l) => l.team?.name)).toEqual([
      "Product Engineering",
      "Business Development",
    ]);
    // Two workspaces connected: each line names its own.
    expect(kestrel.lines[0]!.workspace).toBe("Kestrel Health [placeholder]");
  });

  it("with two ticked, says where Primary ends and what waits, in words", async () => {
    const v = await view([...FROM_LINEAR_IDS.ticked]);
    expect(v.ticked).toEqual([...FROM_LINEAR_IDS.ticked]);
    expect(v.line).toBe(
      "With this, Primary runs to 13:00 at the top of its ranges: past Work's end at 12:00. Secondary and Stretch wait.",
    );
  });

  it("hides the line with nothing ticked, and words a fit without a past", async () => {
    expect((await view([])).line).toBeNull();
    expect((await view([FROM_LINEAR_IDS.ticked[0]])).line).toBe(
      "With this, Primary runs to 11:00 at the top of its ranges.",
    );
  });

  it("filters by size, search and Not done", async () => {
    const sized = await view([], { sizes: ["quick"] });
    expect(rows(sized).map((r) => r.sizeWord)).toEqual(
      rows(sized).map(() => "1 Quick"),
    );
    expect(
      rows(await view([], { query: "eng-14" })).map((r) => r.identifier),
    ).toEqual(["ENG-142", "ENG-140"]);
    const done = (v: PickerView) =>
      rows(v).some((r) => r.identifier === "KES-41");
    expect(done(await view([]))).toBe(false);
    expect(done(await view([], { notDone: false }))).toBe(true);
  });
});
