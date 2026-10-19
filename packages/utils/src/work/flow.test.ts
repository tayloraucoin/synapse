import { describe, expect, it } from "vitest";
import { flowWorkBlock, type FlowEvent, type FlowRow } from "./flow";

const at = (hhmm: string) => new Date(`2026-10-12T${hhmm}:00Z`);
const BLOCK = { start: at("09:30"), end: at("12:00") };

const row = (
  slotId: string,
  tier: FlowRow["tier"],
  topMin: number | null,
  extra: Partial<FlowRow> = {},
): FlowRow => ({
  slotId,
  tier,
  topMin,
  doneAt: null,
  running: false,
  ...extra,
});

const SYNC: FlowEvent = {
  id: "sync",
  start: at("10:30"),
  end: at("11:00"),
  title: "[Design sync]",
};

/** The board's block at 10:20 (meeting-coming-up.md). */
const BOARD = [
  row("review", "primary", 30),
  row("retry", "primary", 20),
  row("answer", "secondary", 20),
  row("agent", "secondary", 30),
  row("tidy", "stretch", 15),
];

const times = (flow: ReturnType<typeof flowWorkBlock>) =>
  flow.rows.map((r) => [
    r.slotId,
    r.start.toISOString().slice(11, 16),
    r.end.toISOString().slice(11, 16),
  ]);

describe("C1: flowWorkBlock lays the block's undone rows from now around its meetings", () => {
  it("places the band where the plan reaches its start, names the crossing row and pushes later rows by its length", () => {
    const flow = flowWorkBlock({
      block: { start: BLOCK.start, end: at("13:00") },
      rows: BOARD,
      events: [SYNC],
      now: at("10:20"),
    });
    expect(flow.rows[0]).toEqual({
      slotId: "review",
      start: at("10:20"),
      end: at("10:50"),
      pastEvent: { id: "sync", title: "[Design sync]" },
    });
    // The 20 min left of [Review] count after the meeting: 11:20 on.
    expect(times(flow).slice(1)).toEqual([
      ["retry", "11:20", "11:40"],
      ["answer", "11:40", "12:00"],
      ["agent", "12:00", "12:30"],
      ["tidy", "12:30", "12:45"],
    ]);
    expect(flow.bands).toEqual([{ eventId: "sync", afterSlotId: "review" }]);
  });

  it("without the meeting, every row starts its length sooner (C-USE-today-meeting-coming-up-3)", () => {
    const flow = flowWorkBlock({
      block: { start: BLOCK.start, end: at("13:00") },
      rows: BOARD,
      events: [],
      now: at("10:20"),
    });
    const withMeeting = flowWorkBlock({
      block: { start: BLOCK.start, end: at("13:00") },
      rows: BOARD,
      events: [SYNC],
      now: at("10:20"),
    });
    for (const [index, laid] of withMeeting.rows.slice(1).entries()) {
      const plain = flow.rows[index + 1]!;
      expect(laid.start.getTime() - plain.start.getTime()).toBe(30 * 60_000);
    }
  });

  it("slides Stretch first, then Secondary, when the block overflows; Primary stays", () => {
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: BOARD,
      events: [SYNC],
      now: at("10:20"),
    });
    expect(flow.slid).toEqual(["tidy", "agent"]);
    expect(flow.rows.map((r) => r.slotId)).toEqual([
      "review",
      "retry",
      "answer",
    ]);
  });

  it("slides nothing when the block holds it all", () => {
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: [row("a", "primary", 30), row("b", "stretch", 15)],
      events: [SYNC],
      now: at("10:00"),
    });
    expect(flow.slid).toEqual([]);
    expect(times(flow)).toEqual([
      ["a", "10:00", "10:30"],
      ["b", "11:00", "11:15"],
    ]);
    expect(flow.bands).toEqual([{ eventId: "sync", afterSlotId: "a" }]);
  });

  it("never slides Urgent, Primary or the running row", () => {
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: [
        row("u", "urgent", 120),
        row("p", "primary", 120),
        row("s", "stretch", 60, { running: true }),
      ],
      events: [],
      now: at("09:30"),
    });
    expect(flow.slid).toEqual([]);
    expect(flow.rows.map((r) => r.slotId)).toEqual(["s", "u", "p"]);
  });

  it("skips done rows and lays the running row first", () => {
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: [
        row("done", "primary", 45, { doneAt: at("10:00") }),
        row("next", "primary", 30),
        row("run", "secondary", 20, { running: true }),
      ],
      events: [],
      now: at("10:00"),
    });
    expect(times(flow)).toEqual([
      ["run", "10:00", "10:20"],
      ["next", "10:20", "10:50"],
    ]);
  });

  it("puts a meeting under way ahead of every row, and starts the plan at its end", () => {
    const standup: FlowEvent = {
      id: "standup",
      start: at("11:00"),
      end: at("11:15"),
      title: "[Standup]",
    };
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: [row("next", "primary", 30)],
      events: [standup],
      now: at("11:00"),
    });
    expect(flow.bands).toEqual([{ eventId: "standup", afterSlotId: null }]);
    expect(times(flow)).toEqual([["next", "11:15", "11:45"]]);
  });

  it("drops a meeting already over, and puts one past every row after the last", () => {
    const flow = flowWorkBlock({
      block: BLOCK,
      rows: [row("a", "primary", 10)],
      events: [
        { id: "gone", start: at("09:40"), end: at("10:00"), title: "Gone" },
        SYNC,
      ],
      now: at("10:05"),
    });
    expect(flow.bands).toEqual([{ eventId: "sync", afterSlotId: "a" }]);
    expect(flow.rows[0]!.pastEvent).toBeUndefined();
  });

  it("is total: no rows, no block, bad dates", () => {
    expect(
      flowWorkBlock({
        block: { start: new Date(Number.NaN), end: new Date(Number.NaN) },
        rows: [row("a", "primary", null)],
        events: [],
        now: new Date(Number.NaN),
      }).rows,
    ).toHaveLength(1);
    expect(
      flowWorkBlock({
        block: BLOCK,
        rows: [],
        events: [SYNC],
        now: at("10:00"),
      }),
    ).toEqual({
      rows: [],
      bands: [{ eventId: "sync", afterSlotId: null }],
      slid: [],
    });
  });
});
