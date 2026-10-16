import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { NOW_COPY as COPY } from "@/app/(shell)/today/_components/now/copy";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { TODAY_WORK_IDS } from "@/lib/fixtures/scenarios/today-desk";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import { slotEventFor } from "./running";
import { stillFiringRows } from "./still-firing";
import { deriveTodayWork } from "./today-work";
import { deriveNow } from "./use-now";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * C6 (USE-110; interactions/firing.md step 5, C-USE-firing-2, D-USE-57):
 * Work ends at 12:00 with [Portal sign-in] firing; at 12:20 Lunch's Now
 * shows it under "Still firing, from Work", and Bring back or Done takes it
 * off, as the tiers' own writes do. The capture is the hardening pass's.
 */

const MONDAY = "2026-10-12";
const PORTAL = TODAY_WORK_IDS.slots.portal;

async function open(at?: string) {
  const scenario = resolveScenario("firing-still-firing");
  const now = new Date(at ?? scenario.now);
  const server = createFixtureServer(scenario, () => now);
  const linear = await server.readLinear();
  async function read() {
    const records = await server.readToday(MONDAY);
    const today = deriveToday(records);
    const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
    const weekView = deriveWeekView({
      weekKey: weekKeyOf(MONDAY),
      week,
      pool: null,
      todayKey: MONDAY,
    });
    const work = deriveTodayWork({
      today,
      day: weekView.days.find((day) => day.dateKey === MONDAY) ?? null,
      now,
      clientFor: () => null,
      issueFor: (item) => joinIssue(linear, item),
    });
    return { now: deriveNow(today, now, null), work };
  }
  return { server, now, read };
}

describe("C6: Work ends with an item firing", () => {
  it("at 12:20 Lunch's Now carries Still firing, from Work, until the 13:00 Work block", async () => {
    const { read } = await open();
    const { now, work } = await read();
    expect(now.block).toMatchObject({
      name: "Lunch",
      firingFrom: { name: "Work", nextWorkAt: "13:00" },
    });
    const rows = stillFiringRows(work);
    expect(rows.map(({ row }) => row.id)).toEqual([PORTAL]);
    expect(rows[0]!.row.firing?.time).toBe("22 min");
    expect(COPY.stillFiring.heading("Work")).toBe("Still firing, from Work");
    expect(COPY.stillFiring.line(rows[0]!.word, "Work", "13:00")).toBe(
      `Tap the mark when it's back; it waits in ${rows[0]!.word} for the 13:00 Work block. Done works from here too.`,
    );
  });

  it("inside Work it is not carried: the tiers show it in place", async () => {
    const { read } = await open("2026-10-12T11:59:00-04:00");
    const { now } = await read();
    expect(now.block?.kind).toBe("work");
    expect(now.block?.firingFrom).toBeNull();
  });

  it("Bring back takes it off; nothing else is written", async () => {
    const { server, now, read } = await open();
    await server.writeSlotEvents([slotEventFor(PORTAL, "brought_back", now)]);
    const { work } = await read();
    expect(stillFiringRows(work)).toEqual([]);
  });

  it("Done takes it off too", async () => {
    const { server, now, read } = await open();
    await server.writeSlotEvents([slotEventFor(PORTAL, "done", now)]);
    await server.writeSlots({ id: PORTAL, doneAt: now.toISOString() });
    const { work } = await read();
    expect(stillFiringRows(work)).toEqual([]);
  });
});
