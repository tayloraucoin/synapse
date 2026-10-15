import { describe, expect, it } from "vitest";
import { weekKeyOf } from "@syn/utils";
import { stateId } from "@/lib/fixtures/integrations/workspaces";
import { TODAY_WORK_IDS } from "@/lib/fixtures/scenarios/today-desk";
import {
  TODAY_LINEAR_OUTBOX,
  TODAY_LINEAR_SCENARIOS,
} from "@/lib/fixtures/scenarios/today-linear";
import { createFixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { joinIssue } from "./integration-records";
import { deriveTodayWork } from "./today-work";
import { deriveWeek } from "./use-week";
import { deriveWeekView } from "./week-view";

/**
 * USE-63: Linear's side of work's Today, read from its scenarios as the
 * screen reads them. Waiting is statusEffect's and never Next (C1, D-USE-78);
 * a failed write keeps Synapse's state; closed in Linear shows done.
 */

const MONDAY = "2026-10-12";
const S = TODAY_WORK_IDS.slots;

function serverFor(name: string) {
  const scenario = TODAY_LINEAR_SCENARIOS[name]!();
  const now = new Date(scenario.now);
  return { scenario, now, server: createFixtureServer(scenario, () => now) };
}

async function read(server: ReturnType<typeof serverFor>["server"], now: Date) {
  const week = deriveWeek(await server.readWeek(weekKeyOf(MONDAY)));
  const view = deriveWeekView({
    weekKey: weekKeyOf(MONDAY),
    week,
    pool: null,
    todayKey: MONDAY,
  });
  const today = deriveToday(await server.readToday(MONDAY));
  const linear = await server.readLinear();
  return deriveTodayWork({
    today,
    day: view.days.find((day) => day.dateKey === MONDAY) ?? null,
    now,
    clientFor: () => null,
    issueFor: (item) => joinIssue(linear, item),
  });
}

const rowIds = (work: Awaited<ReturnType<typeof read>>) =>
  work.tiers.flatMap((group) => group.rows.map((row) => row.id));

describe("Waiting (C1)", () => {
  it("takes In review and Blocked out of the tiers, never Next", async () => {
    const { server, now } = serverFor("today-waiting");
    const work = await read(server, now);
    expect(work.waiting.map((row) => [row.id, row.status.label])).toEqual([
      [S.portal, "Blocked"],
      [S.desk, "In review"],
    ]);
    expect(rowIds(work)).not.toContain(S.portal);
    expect(rowIds(work)).not.toContain(S.desk);
    expect(work.nextRow?.id).toBe(S.alder);
    // Every tier heading keeps its word; Stretch is there.
    expect(work.tiers.map((group) => group.word)).toContain("Stretch");
  });

  it("returns to its tier and place when its status moves on", async () => {
    const { server, now, scenario } = serverFor("today-waiting");
    const portal = scenario.records.slots.find((row) => row.id === S.portal)!;
    await server.writeLinearIssue({
      workItemId: portal.workItemId!,
      stateId: stateId("KES", "In progress"),
    });
    const work = await read(server, now);
    expect(work.waiting.map((row) => row.id)).toEqual([S.desk]);
    const primary = work.tiers.find((group) => group.tier === "primary")!;
    expect(primary.rows.map((row) => row.id)).toEqual([S.portal, S.alder]);
    // Back in place it is Next again, ahead of [Alder intro].
    expect(work.nextRow?.id).toBe(S.portal);
  });
});

describe("Linear's lines", () => {
  it("keeps a failed Done done, with Not updated in Linear. (failed-1)", async () => {
    const { server, now } = serverFor("today-linear-failed");
    const work = await read(server, now);
    const portal = work.tiers
      .flatMap((group) => group.rows)
      .find((row) => row.id === S.portal)!;
    expect(portal.form).toBe("done");
    expect(portal.doneRecord).toBe("Took 1 h 10 · fired 32 min");
    expect(portal.linear).toEqual({
      kind: "failed",
      text: "Not updated in Linear.",
      retry: "Try again",
      writeId: TODAY_LINEAR_OUTBOX.failed,
    });
    // Try again sends the same row, never a second one.
    await server.retryLinearWrite(TODAY_LINEAR_OUTBOX.failed);
    server.sendLinearOutbox();
    const linear = await server.readLinear();
    expect(linear.outbox.filter((row) => row.kind === "done")).toEqual([
      expect.objectContaining({
        id: TODAY_LINEAR_OUTBOX.failed,
        state: "sent",
      }),
    ]);
    const after = (await read(server, now)).tiers
      .flatMap((group) => group.rows)
      .find((row) => row.id === S.portal)!;
    expect(after.form).toBe("done");
    expect(after.linear ?? null).toBeNull();
  });

  it("names the status in flight (updating-1) and shows closed in Linear (updating-2)", async () => {
    const { server, now } = serverFor("today-linear-updating");
    const rows = (await read(server, now)).tiers.flatMap((group) => group.rows);
    expect(rows.find((row) => row.id === S.sms)?.linear).toEqual({
      kind: "updating",
      text: "Moving to In progress in Linear…",
    });
    const desk = rows.find((row) => row.id === S.desk)!;
    expect(desk.form).toBe("done");
    expect(desk.linear).toMatchObject({
      kind: "closed",
      text: "Done in Linear at 10:12 · all its sessions close",
      reopen: "Reopen",
    });
  });

  it("closes every session in Linear's close, and Reopen opens them all", async () => {
    const { server, scenario } = serverFor("today-linear-updating");
    const item = scenario.records.workItems.find(
      (row) =>
        row.id ===
        scenario.records.slots.find((slot) => slot.id === S.desk)!.workItemId,
    )!;
    // Every session of it, this week's and next's, read through the server.
    const sessions = async () =>
      (
        await Promise.all(
          ["2026-10-12", "2026-10-15", "2026-10-19"].map((date) =>
            server.readToday(date),
          ),
        )
      )
        .flatMap((day) => day.slots)
        .filter((row) => row.workItemId === item.id);
    expect((await sessions()).length).toBeGreaterThan(1);
    expect((await sessions()).every((row) => row.doneAt !== null)).toBe(true);
    await server.reopenTask({ workItemId: item.id });
    await server.writeLinearDone({ workItemId: item.id, done: false });
    expect((await sessions()).every((row) => row.doneAt === null)).toBe(true);
    const issue = joinIssue(await server.readLinear(), item);
    expect(issue?.status.state.name).toBe("In progress");
    expect(issue?.write).toMatchObject({ kind: "reopen", state: "pending" });
  });
});
