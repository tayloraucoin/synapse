import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { resolveScenario } from "@/lib/fixtures/scenarios";
import { onSunday, SUNDAY_DATE } from "@/lib/fixtures/scenarios/now-forms";
import { createFixtureServer, type FixtureServer } from "@/lib/fixtures/server";
import { deriveToday } from "./derive-today";
import { tickOf, tickOptions } from "./tick-write";
import type { TodayRecords } from "./today-records";
import { deriveReviewDay } from "./use-review-day";
import { todayQueryKey } from "./use-today";

/**
 * A checklist's box through the fixtures, as Now writes it: the tick shows
 * before the server answers, settles on its answer, and a failed write puts
 * the box back, so the screen never shows a tick the server does not have.
 */

const NAME = "review-sunday-checklist-and-plans";

function setup() {
  const now = () => new Date(onSunday("09:00"));
  const scenario = resolveScenario(NAME);
  const fixture = createFixtureServer(scenario, now);
  let placings = 0;
  const failing = new Set<string>();
  // Writes wait at the gate until a test opens it: the server not yet answered.
  let open!: () => void;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });
  // The fixture server, with a slot write that fails for the rows named.
  const server: FixtureServer = {
    ...fixture,
    writeSlots: async (input) => {
      await gate;
      if (!("id" in input)) placings += 1;
      const target = "id" in input ? input.id : input.blockItemId;
      if (target && failing.has(target)) {
        throw new Error("The write did not land.");
      }
      return fixture.writeSlots(input);
    },
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const key = todayQueryKey(scenario.name, SUNDAY_DATE);
  queryClient.setQueryDefaults(key, {
    queryFn: () => fixture.readToday(SUNDAY_DATE),
  });
  return {
    source: { scenario, server, now },
    fixture,
    queryClient,
    key,
    failing,
    open: () => open(),
    placings: () => placings,
    async load() {
      await queryClient.fetchQuery({ queryKey: key });
    },
    /** The checklist as the screen reads it from the cache. */
    shown() {
      const records = queryClient.getQueryData<TodayRecords>(key)!;
      return deriveReviewDay(deriveToday(records)).allDay!;
    },
    async stored() {
      const records = await fixture.readToday(SUNDAY_DATE);
      return deriveReviewDay(deriveToday(records)).allDay!;
    },
    tick(rowId: string, done: boolean) {
      const records = queryClient.getQueryData<TodayRecords>(key)!;
      const checklist = this.shown();
      const slot = records.slots.find((row) => row.blockItemId === rowId);
      const item = records.blockItems.find((row) => row.id === rowId)!;
      const observer = new MutationObserver(
        queryClient,
        tickOptions({ scenario, server }, queryClient),
      );
      const sent = observer.mutate(
        tickOf(
          { dateKey: SUNDAY_DATE, blockId: checklist.id },
          {
            slotId: slot?.id ?? null,
            blockItemId: rowId,
            todoId: null,
            sortOrder: slot?.sortOrder ?? item.sortOrder,
          },
          done
            ? { doneAt: now().toISOString(), tookMin: null }
            : { doneAt: null, tookMin: null },
        ),
      );
      // Settled either way; each test reads the outcome from the cache.
      sent.catch(() => undefined);
      return sent;
    },
  };
}

const checkedOf = (
  checklist: { rows: { id: string; checked: boolean }[] },
  id: string,
) => checklist.rows.find((row) => row.id === id)?.checked;

describe("a checklist tick is optimistic", () => {
  it("shows before the server answers, then settles on what the server has", async () => {
    const t = setup();
    await t.load();
    const [first] = t.shown().rows;
    expect(first!.checked).toBe(false);

    const sent = t.tick(first!.id, true);
    // Before the server answers: shown, not stored.
    await vi.waitFor(() => expect(checkedOf(t.shown(), first!.id)).toBe(true));
    expect(checkedOf(await t.stored(), first!.id)).toBe(false);

    t.open();
    await sent;
    expect(checkedOf(await t.stored(), first!.id)).toBe(true);
    expect(checkedOf(t.shown(), first!.id)).toBe(true);
  });

  it("a failed tick rolls back: the box shows what the server has", async () => {
    const t = setup();
    await t.load();
    const [first] = t.shown().rows;
    t.failing.add(first!.id);

    const sent = t.tick(first!.id, true);
    await vi.waitFor(() => expect(checkedOf(t.shown(), first!.id)).toBe(true));

    t.open();
    await expect(sent).rejects.toThrow();
    expect(checkedOf(t.shown(), first!.id)).toBe(false);
    expect(checkedOf(await t.stored(), first!.id)).toBe(false);
    // No stand-in is left behind for the row.
    const records = t.queryClient.getQueryData<TodayRecords>(t.key)!;
    expect(records.slots.some((row) => row.blockItemId === first!.id)).toBe(
      false,
    );
  });

  it("one failed tick beside one that lands: only the landed one shows", async () => {
    const t = setup();
    await t.load();
    const [first, second] = t.shown().rows;
    t.failing.add(first!.id);

    const a = t.tick(first!.id, true);
    const b = t.tick(second!.id, true);
    await vi.waitFor(() => expect(checkedOf(t.shown(), second!.id)).toBe(true));
    t.open();
    await expect(a).rejects.toThrow();
    await b;

    expect(checkedOf(t.shown(), first!.id)).toBe(false);
    expect(checkedOf(t.shown(), second!.id)).toBe(true);
    expect(checkedOf(await t.stored(), first!.id)).toBe(false);
    expect(checkedOf(await t.stored(), second!.id)).toBe(true);
  });

  it("tick then untick at once places the row's slot once and ends unticked", async () => {
    const t = setup();
    await t.load();
    const [first] = t.shown().rows;

    const on = t.tick(first!.id, true);
    await vi.waitFor(() => expect(checkedOf(t.shown(), first!.id)).toBe(true));
    // The untick is made on the cache the tick already wrote (its stand-in).
    const off = t.tick(first!.id, false);
    await vi.waitFor(() => expect(checkedOf(t.shown(), first!.id)).toBe(false));
    t.open();
    await Promise.all([on, off]);

    expect(t.placings()).toBe(1);
    expect(checkedOf(t.shown(), first!.id)).toBe(false);
    expect(checkedOf(await t.stored(), first!.id)).toBe(false);
  });
});
