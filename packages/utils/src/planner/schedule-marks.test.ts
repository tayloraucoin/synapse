import { describe, expect, it } from "vitest";
import { placeEvents, scheduleMark, underWay } from "./schedule-marks";

const at = (time: string) => new Date(`2026-10-12T${time}:00-04:00`);
const span = (id: string, start: string, end: string) => ({
  id,
  start: at(start),
  end: at(end),
});

describe("C6: scheduleMark", () => {
  it("gives done, running, firing or planned from a slot and its clock", () => {
    expect(scheduleMark({ doneAt: "2026-10-12T14:00:00Z" }, null)).toBe("done");
    expect(scheduleMark(null, { state: "done" })).toBe("done");
    expect(scheduleMark({ doneAt: null }, { state: "running" })).toBe(
      "running",
    );
    expect(scheduleMark({ doneAt: null }, { state: "firing" })).toBe("firing");
    expect(scheduleMark({ doneAt: null }, { state: "paused" })).toBe("planned");
    expect(scheduleMark(null, undefined)).toBe("planned");
  });
});

describe("C6: underWay", () => {
  const blocks = [
    span("wellness", "07:05", "08:00"),
    span("work", "09:30", "12:00"),
  ];

  it("gives the block holding now, one only", () => {
    expect(
      underWay({
        blocks,
        allDay: { id: "sunday" },
        now: at("10:20"),
        phase: "live",
      }),
    ).toEqual({ kind: "block", id: "work" });
    const nested = [...blocks, span("inner", "10:00", "11:00")];
    expect(
      underWay({
        blocks: nested,
        allDay: null,
        now: at("10:20"),
        phase: "live",
      }),
    ).toEqual({ kind: "block", id: "inner" });
  });

  it("gives the strip between set-time blocks, nothing before Ready, go", () => {
    expect(
      underWay({
        blocks,
        allDay: { id: "sunday" },
        now: at("09:00"),
        phase: "live",
      }),
    ).toEqual({ kind: "all-day", id: "sunday" });
    expect(
      underWay({ blocks, allDay: null, now: at("09:00"), phase: "live" }),
    ).toBeNull();
    expect(
      underWay({
        blocks,
        allDay: { id: "sunday" },
        now: at("10:20"),
        phase: "before-go",
      }),
    ).toBeNull();
  });
});

describe("C6: placeEvents", () => {
  const work = {
    id: "work",
    startsAt: "09:30",
    endsAt: "12:00",
    items: [
      { id: "sync", lengthMin: 25, atTime: null },
      { id: "paper", lengthMin: 30, atTime: null },
      { id: "comments", lengthMin: 30, atTime: null },
    ],
  };
  const meeting = { id: "sync-meeting", startsAt: "10:30", endsAt: "11:00" };
  const lunch = { id: "lunch", startsAt: "13:00", endsAt: "14:30" };

  it("returns an event inside a block as its band, items before and after", () => {
    const placed = placeEvents([work], [meeting, lunch]);
    expect(placed.inBlocks.get("work")).toEqual({
      bands: [meeting],
      segments: [["sync", "paper"], ["comments"]],
    });
    expect(placed.free).toEqual([lunch]);
  });

  it("leaves a block with no event out, and never splits an item", () => {
    const placed = placeEvents([work], []);
    expect(placed.inBlocks.size).toBe(0);
    const all = placeEvents([work], [meeting]).inBlocks.get("work")!.segments;
    expect(all.flat()).toEqual(["sync", "paper", "comments"]);
  });
});
