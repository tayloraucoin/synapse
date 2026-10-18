import { describe, expect, it } from "vitest";
import { occursOn, parseRule } from "@syn/utils";
import {
  blockChangeInput,
  editBlockInput,
  newBlockInput,
  newTransitionInput,
  type BlockRecord,
} from "@syn/validators";
import { block, change, DAILY, item, slot } from "./planner-rows.fixture";
import {
  planBlockChange,
  planCreateBlock,
  planCreateTransition,
  planEditBlock,
  planSplitBlock,
} from "./write-blocks";
import { reachOf } from "./write-plan";
import { expectRefusal, journalOver, NOW_ISO } from "./write-plan.fixture";

/** USE-92 C1 (the block writes) and C2 (the scope question), over rows in memory. */

const MON = "2026-10-19";
const TUE = "2026-10-20";
const WED = "2026-10-21";
const ONE_DATE = "2026-10-22";

function runsOn(row: BlockRecord, dateKey: string): boolean {
  if (row.rrule === null) return row.onDate === dateKey;
  const parsed = parseRule(row.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

describe("the block writes (C-USE-92-1)", () => {
  it("createBlock writes the block the fixture writes, and names a usual weekday's reach", () => {
    const journal = journalOver();
    const out = planCreateBlock(
      journal,
      newBlockInput.parse({
        kind: "life",
        name: "Groceries",
        startsAt: "10:00",
        endsAt: "11:00",
        rrule: DAILY,
      }),
      { weekday: 6 },
    );
    const [row] = journal.rows.blocks;
    expect(row).toEqual({
      id: out.id,
      createdAt: NOW_ISO,
      updatedAt: NOW_ISO,
      kind: "life",
      name: "Groceries",
      icon: null,
      color: null,
      startsAt: "10:00",
      endsAt: "11:00",
      rrule: DAILY,
      onDate: null,
      fill: null,
      checklist: false,
      meal: false,
      notify: false,
      archivedAt: null,
    });
    expect(out.reach).toEqual({ weekday: 6 });
    // Saturday 08:00: Sunday the 18th has not begun, so the change reaches it.
    expect(reachOf(journal, 6)).toEqual({ weekday: 6, follows: "2026-10-18" });
    expect(journal.changes()).toEqual([
      { table: "blocks", id: out.id, before: null, after: row },
    ]);
  });

  it("createTransition writes an item in a block, and a transition block between blocks", () => {
    const morning = block();
    const journal = journalOver({ blocks: [morning] });
    const inBlock = planCreateTransition(
      journal,
      newTransitionInput.parse({
        placement: "in_block",
        blockId: morning.id,
        name: "Walk over",
        atTime: "07:30",
        lengthMin: 10,
        sortOrder: 2,
      }),
    );
    expect(journal.rows.blockItems).toEqual([
      expect.objectContaining({
        id: inBlock.id,
        blockId: morning.id,
        title: "Walk over",
        isTransition: true,
        atTime: "07:30",
        lengthMin: 10,
        onDate: null,
        sortOrder: 2,
      }),
    ]);

    const between = planCreateTransition(
      journal,
      newTransitionInput.parse({
        placement: "between_blocks",
        name: "Commute",
        startsAt: "08:00",
        endsAt: "08:30",
        onDate: ONE_DATE,
      }),
    );
    expect(journal.rows.blocks.find((b) => b.id === between.id)).toEqual(
      expect.objectContaining({
        kind: "transition",
        name: "Commute",
        fill: null,
        onDate: ONE_DATE,
        rrule: null,
      }),
    );
  });

  it("createTransition in a block not the caller's is refused as the fixture refuses it", () => {
    const journal = journalOver();
    expectRefusal(
      () =>
        planCreateTransition(
          journal,
          newTransitionInput.parse({
            placement: "in_block",
            blockId: "00000000-0000-4000-8000-999999999999",
            name: "Walk over",
            atTime: "07:30",
            lengthMin: 10,
            sortOrder: 0,
          }),
        ),
      "unknown",
      "No block with that id.",
    );
    expect(journal.changes()).toEqual([]);
  });

  it("editBlock checks a lone time against the stored other one, in the schema's words", () => {
    const morning = block({ startsAt: "07:00", endsAt: "08:00" });
    const journal = journalOver({ blocks: [morning] });
    expectRefusal(
      () =>
        planEditBlock(
          journal,
          editBlockInput.parse({ id: morning.id, startsAt: "09:00" }),
        ),
      "invalid",
      "Ends after it starts.",
    );
    expectRefusal(
      () =>
        planEditBlock(
          journal,
          editBlockInput.parse({ id: block().id, name: "Gone" }),
        ),
      "unknown",
      "No block with that id.",
    );
  });

  it("writeBlockChange writes one row per block per date, merging the look", () => {
    const morning = block();
    const had = change({
      blockId: morning.id,
      onDate: TUE,
      startsAt: "07:30",
      endsAt: "08:30",
      name: "Slow morning",
    });
    const journal = journalOver({ blocks: [morning], blockChanges: [had] });
    const out = planBlockChange(
      journal,
      blockChangeInput.parse({
        blockId: morning.id,
        onDate: TUE,
        startsAt: "08:00",
        endsAt: "09:00",
      }),
    );
    expect(out.id).toBe(had.id);
    expect(journal.rows.blockChanges).toEqual([
      {
        ...had,
        updatedAt: NOW_ISO,
        startsAt: "08:00",
        endsAt: "09:00",
        name: "Slow morning",
      },
    ]);
  });

  it("writeBlockChange on a date the block does not run is refused not-on-date", () => {
    const oneDay = block({ rrule: null, onDate: ONE_DATE });
    const journal = journalOver({ blocks: [oneDay] });
    expectRefusal(
      () =>
        planBlockChange(
          journal,
          blockChangeInput.parse({
            blockId: oneDay.id,
            onDate: MON,
            skipped: true,
          }),
        ),
      "not-on-date",
      "That block is not on that date.",
    );
  });
});

describe("the scope question (C-USE-92-2)", () => {
  it("this date writes one block_change and leaves the block", () => {
    const morning = block();
    const journal = journalOver({ blocks: [morning] });
    planBlockChange(
      journal,
      blockChangeInput.parse({
        blockId: morning.id,
        onDate: TUE,
        skipped: true,
      }),
    );
    expect(journal.rows.blocks).toEqual([morning]);
    expect(journal.rows.blockChanges).toEqual([
      expect.objectContaining({
        blockId: morning.id,
        onDate: TUE,
        skipped: true,
        startsAt: null,
        endsAt: null,
      }),
    ]);
    // D-USE-80: the rule is untouched; no EXDATE.
    expect(journal.rows.blocks[0]!.rrule).toBe(DAILY);
  });

  it("all edits the block itself, so every date it runs", () => {
    const morning = block();
    const journal = journalOver({ blocks: [morning] });
    planEditBlock(
      journal,
      editBlockInput.parse({ id: morning.id, startsAt: "06:30" }),
    );
    expect(journal.rows.blocks).toEqual([
      { ...morning, startsAt: "06:30", updatedAt: NOW_ISO },
    ]);
    expect(journal.rows.blockChanges).toEqual([]);
  });

  it("this and following ends the old rule the day before and starts a new block on the date", () => {
    const morning = block();
    const stretch = item({ blockId: morning.id });
    const tueOnly = item({ blockId: morning.id, title: "Call", onDate: WED });
    const monSlot = slot({
      blockId: morning.id,
      onDate: MON,
      blockItemId: stretch.id,
    });
    const wedSlot = slot({
      blockId: morning.id,
      onDate: WED,
      blockItemId: stretch.id,
    });
    const tueMove = change({
      blockId: morning.id,
      onDate: TUE,
      startsAt: "07:30",
      endsAt: "08:30",
    });
    const wedSkip = change({ blockId: morning.id, onDate: WED, skipped: true });
    const journal = journalOver({
      blocks: [morning],
      blockItems: [stretch, tueOnly],
      slots: [monSlot, wedSlot],
      blockChanges: [tueMove, wedSkip],
    });

    const out = planSplitBlock(journal, {
      id: morning.id,
      fromDate: TUE,
      patch: { startsAt: "06:30", endsAt: "07:30" },
    });

    const old = journal.rows.blocks.find((b) => b.id === morning.id)!;
    const next = journal.rows.blocks.find((b) => b.id === out.id)!;
    expect(out.id).not.toBe(morning.id);
    // No date dropped or doubled: Monday is the old block's, Tuesday on the new one's.
    expect(runsOn(old, MON)).toBe(true);
    expect(runsOn(old, TUE)).toBe(false);
    expect(runsOn(next, MON)).toBe(false);
    expect(runsOn(next, TUE)).toBe(true);
    expect(runsOn(next, WED)).toBe(true);
    expect(old.startsAt).toBe("07:00");
    expect(next).toEqual(
      expect.objectContaining({
        startsAt: "06:30",
        endsAt: "07:30",
        onDate: null,
      }),
    );

    // The usual item is copied; the date's own item and the later slot move.
    const copy = journal.rows.blockItems.find(
      (i) => i.blockId === next.id && i.onDate === null,
    )!;
    expect(copy.title).toBe("Stretch");
    expect(
      journal.rows.blockItems.find((i) => i.id === stretch.id)!.blockId,
    ).toBe(morning.id);
    expect(
      journal.rows.blockItems.find((i) => i.id === tueOnly.id)!.blockId,
    ).toBe(next.id);
    expect(journal.rows.slots.find((s) => s.id === monSlot.id)).toEqual(
      monSlot,
    );
    expect(journal.rows.slots.find((s) => s.id === wedSlot.id)).toEqual(
      expect.objectContaining({ blockId: next.id, blockItemId: copy.id }),
    );
    // A time change on the cut date goes; later changes move to the new block.
    expect(journal.rows.blockChanges.some((c) => c.id === tueMove.id)).toBe(
      false,
    );
    expect(
      journal.rows.blockChanges.find((c) => c.id === wedSkip.id)!.blockId,
    ).toBe(next.id);

    // One plan, so one transaction: every row it touched is in its changes.
    const touched = journal.changes().map((c) => `${c.table}:${c.id}`);
    expect(touched).toEqual(
      expect.arrayContaining([
        `blocks:${morning.id}`,
        `blocks:${next.id}`,
        `blockItems:${copy.id}`,
        `blockItems:${tueOnly.id}`,
        `slots:${wedSlot.id}`,
        `blockChanges:${tueMove.id}`,
        `blockChanges:${wedSkip.id}`,
      ]),
    );
  });

  it("this and following from the rule's first date is the block itself, as all", () => {
    const morning = block({
      rrule: "DTSTART;VALUE=DATE:20261019\nRRULE:FREQ=DAILY",
    });
    const journal = journalOver({ blocks: [morning] });
    const out = planSplitBlock(journal, {
      id: morning.id,
      fromDate: MON,
      patch: { name: "Early" },
    });
    expect(out.id).toBe(morning.id);
    expect(journal.rows.blocks).toEqual([
      { ...morning, name: "Early", updatedAt: NOW_ISO },
    ]);
  });

  it("this and following on a one-date block, or a date it does not run, is refused", () => {
    const oneDay = block({ rrule: null, onDate: ONE_DATE });
    const journal = journalOver({ blocks: [oneDay] });
    expectRefusal(
      () =>
        planSplitBlock(journal, {
          id: oneDay.id,
          fromDate: ONE_DATE,
          patch: {},
        }),
      "invalid",
      "A block on one date has no following dates.",
    );
    expectRefusal(
      () =>
        planSplitBlock(journal, { id: oneDay.id, fromDate: MON, patch: {} }),
      "not-on-date",
      "That block is not on that date.",
    );
  });
});
