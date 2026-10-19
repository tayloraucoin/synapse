import { describe, expect, it } from "vitest";
import { countSessions, type WorkTier } from "@syn/utils";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import {
  PLACE_SHEET_DATE,
  PLACE_SHEET_NOW,
  type PlaceSheetScenarioName,
} from "@/lib/fixtures/scenarios/place-sheet";
import { POOL_SHEET_IDS } from "@/lib/fixtures/scenarios/pool-sheet";
import { createFixtureServer } from "@/lib/fixtures/server";
import { writePlace } from "./place";
import { placeItemOf, placeSheetView } from "./place-sheet";
import { deriveWeek } from "./use-week";

/**
 * C1 (USE-80): the place sheet worked out on the phone's fixture week,
 * Monday 12 at 21:10. KES-58 (3 Medium) with Tue and Wed picked in Primary;
 * KES-61 on Tue alone in `doesnt-fit`. Then the placing itself: two days are
 * two sessions of the one item, and Undo takes both back.
 */

const KES58 = POOL_SHEET_IDS.workItems.kes58;
const KES61 = POOL_SHEET_IDS.workItems.kes61;
const [MON, TUE, WED, THU] = [
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-15",
];

function setup(name: PlaceSheetScenarioName = "place-sheet") {
  return createFixtureServer(
    resolveScenario(name),
    () => new Date(PLACE_SHEET_NOW),
  );
}

type Server = ReturnType<typeof setup>;

async function view(
  server: Server,
  workItemId: string,
  picked: string[],
  tier: WorkTier = "primary",
) {
  const pool = await server.readPool();
  const week = deriveWeek(await server.readWeek("2026-W42"));
  const item = pool.workItems.find((w) => w.id === workItemId)!;
  const client = pool.clients.find((c) => c.id === item.clientId) ?? null;
  return placeSheetView({
    week,
    item: placeItemOf(item, client?.name ?? null),
    holds: pool.slots
      .filter((s) => s.workItemId === workItemId)
      .map((s) => s.onDate),
    picked,
    tier,
    todayKey: MON,
    dateKey: PLACE_SHEET_DATE,
    from: "pool",
  });
}

describe("C1: the place sheet for KES-58, Tue and Wed in Primary", () => {
  it("names each day's runs-to time, Wed past Work's end, and the action", async () => {
    const v = await view(setup(), KES58, [TUE, WED]);
    expect(v.meta).toBe("Pool · Kestrel Health · KES-58 · 3 Medium · due Wed");
    expect(v.title).toBe("Place [Booking: reschedule flow]");
    expect(v.fits.map((f) => [f.dateKey, f.runsTo, f.fits])).toEqual([
      [TUE, "11:40", true],
      [WED, "12:10", false],
    ]);
    expect(v.fitLine).toBe(
      "Tue's Primary runs to 11:40 at the top of its ranges. Wed's runs to 12:10, past Work's end at 12:00.",
    );
    expect(v.doesntFit).toBeNull();
    expect(v.action).toBe("Place on Tue and Wed");
    expect(v.toast).toBe("Placed on Tue and Wed, in Primary.");
  });

  it("offers the weekdays from today and greys the weekend with its reason", async () => {
    const v = await view(setup(), KES58, [TUE, WED]);
    expect(
      v.chips.map((c) => [c.short, c.offered, c.reason, c.picked]),
    ).toEqual([
      ["M 12", true, null, false],
      ["T 13", true, null, true],
      ["W 14", true, null, true],
      ["T 15", true, null, false],
      ["F 16", true, null, false],
      ["S 17", false, "no-work", false],
      ["S 18", false, "no-work", false],
    ]);
    expect(v.chips[5]!.name).toBe("Saturday 17, No Work block");
  });

  it("a day whose Primary can't hold it gives the card, by how much and the next day with room", async () => {
    const v = await view(setup("doesnt-fit"), KES61, [TUE]);
    expect(v.fitLine).toBeNull();
    expect(v.fits[0]!.overMin).toBe(100);
    expect(v.doesntFit).toEqual({
      dateKey: TUE,
      headline: "Tue's Work doesn't fit it by 1 h 40",
      why: "5 Large runs 2 h; Tue's Primary already holds 2 h 10 at the top of its ranges.",
      spread: true,
      spreadWords: "Spread it across the week",
      next: {
        dateKey: THU,
        line: "Thu 15 has room, 2 h 30",
        use: "Use Thu",
        name: "Use Thursday 15, 2 hours 30 free",
      },
      anyway: "Place on Tue anyway",
    });
    expect(v.action).toBe("Place on Tue anyway");
  });

  it("two days picked say it per day, with no card", async () => {
    const v = await view(setup("doesnt-fit"), KES61, [TUE, THU]);
    expect(v.doesntFit).toBeNull();
    expect(v.fitLine).toBe(
      "Tue's Primary runs to 13:40 at the top of its ranges, past Work's end at 12:00. Thu's runs to 11:30.",
    );
  });
});

describe("Place: one item, n of 2, and Undo takes both back", () => {
  it("places Tue and Wed as two sessions, never copies, and Undo leaves none", async () => {
    const server = setup();
    const v = await view(server, KES58, [TUE, WED]);
    const undos = [];
    for (const to of v.targets) {
      const pool = await server.readPool();
      undos.push(
        (await writePlace(server, { workItemId: KES58 }, to, pool.slots)).undo,
      );
    }
    const pool = await server.readPool();
    const mine = pool.slots.filter((s) => s.workItemId === KES58);
    expect(mine.map((s) => [s.onDate, s.tier])).toEqual([
      [TUE, "primary"],
      [WED, "primary"],
    ]);
    expect(
      pool.workItems.filter((w) => w.title.includes("reschedule")),
    ).toHaveLength(1);
    const sessions = countSessions(
      mine.map((s) => ({ ...s, workItemId: s.workItemId! })),
    );
    expect(mine.map((s) => sessions.get(s.id))).toEqual([
      { n: 1, of: 2 },
      { n: 2, of: 2 },
    ]);

    for (const token of undos.reverse()) await server.undo(token);
    const after = await server.readPool();
    expect(after.slots.filter((s) => s.workItemId === KES58)).toEqual([]);
  });

  it("Place on Tue anyway lands: Tue then runs past Work's end", async () => {
    const server = setup("doesnt-fit");
    const v = await view(server, KES61, [TUE]);
    const pool = await server.readPool();
    await writePlace(server, { workItemId: KES61 }, v.targets[0]!, pool.slots);
    const after = await server.readPool();
    expect(
      after.slots.filter((s) => s.workItemId === KES61).map((s) => s.onDate),
    ).toEqual([TUE]);
  });
});
