import { describe, expect, it } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { BASE_DATE } from "@/lib/fixtures/scenarios/base-day";
import { LOOSE_END_IDS } from "@/lib/fixtures/scenarios/loose-ends";
import { createFixtureServer } from "@/lib/fixtures/server";
import { journalRoute } from "@/lib/routes";
import { deriveToday } from "./derive-today";
import { isJournalItem, journalWritten, withJournalTick } from "./journal-row";
import { deriveNow } from "./use-now";

/**
 * C7 (USE-110; close-the-day/built-and-words.md, states/empty.md, DYN-18):
 * the Wind-down block's Journal row opens Close the day at
 * `/day/{date}/journal`; a field written there ticks it, on Now and in
 * Block view alike (one `withJournalTick`); an empty journal leaves it
 * unticked, with nothing pending or missed.
 */

async function open(name: string) {
  const scenario = resolveScenario(name);
  const now = new Date(scenario.now);
  const server = createFixtureServer(scenario, () => now);
  async function read() {
    const journal = await server.readJournal(BASE_DATE);
    const written = journalWritten(journal.entry);
    const view = deriveNow(
      deriveToday(await server.readToday(BASE_DATE)),
      now,
      null,
      null,
      null,
      written,
    );
    return { view, written };
  }
  return { server, read };
}

const JOURNAL = LOOSE_END_IDS.items.journal;

describe("C7: the Journal row", () => {
  it("opens Close the day for the date, never the Item sheet", () => {
    expect(isJournalItem("Journal")).toBe(true);
    expect(isJournalItem(" journal ")).toBe(true);
    expect(isJournalItem("Wind-down journal")).toBe(false);
    expect(journalRoute(BASE_DATE)).toBe("/day/2026-10-12/journal");
  });

  it("is ticked on Now at 21:40 once a field is written; Lights out lifts", async () => {
    const { view, written } = await (await open("wind-down-journal")).read();
    expect(written).toBe(true);
    expect(view.block?.name).toBe("Wind-down");
    const journal = view.items.find((item) => item.id === JOURNAL);
    expect(journal?.done).toBe(true);
    expect(view.current?.title).toBe("Lights out [placeholder]");
  });

  it("an empty journal leaves it unticked, current, with nothing behind or missed", async () => {
    const { view, written } = await (
      await open("wind-down-journal-empty")
    ).read();
    expect(written).toBe(false);
    expect(view.items.find((item) => item.id === JOURNAL)?.done).toBe(false);
    expect(view.current?.id).toBe(JOURNAL);
    expect(view.block?.behindSince).toBeNull();
    expect(view.closing).toBeNull();
  });

  it("writing a field ticks it; emptying every field clears it again", async () => {
    const { server, read } = await open("wind-down-journal-empty");
    await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "day_went",
      value: "A quiet one.",
    });
    let { view } = await read();
    expect(view.items.find((item) => item.id === JOURNAL)?.done).toBe(true);

    await server.writeJournalAnswer({
      date: BASE_DATE,
      key: "day_went",
      value: "   ",
    });
    ({ view } = await read());
    expect(view.items.find((item) => item.id === JOURNAL)?.done).toBe(false);
  });

  it("Block view's rows take the same tick, and a row ticked by hand stays ticked", () => {
    const rows = [
      { id: "a", title: "Journal", done: false },
      { id: "b", title: "Lights out", done: false },
    ];
    expect(withJournalTick(rows, true).map((row) => row.done)).toEqual([
      true,
      false,
    ]);
    expect(withJournalTick(rows, false).map((row) => row.done)).toEqual([
      false,
      false,
    ]);
    const byHand = [{ id: "a", title: "Journal", done: true }];
    expect(withJournalTick(byHand, false)[0]!.done).toBe(true);
  });
});
