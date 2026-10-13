import { describe, expect, it } from "vitest";
import { eventLanding, reflowItems, type ReflowItem } from "./reflow";

const item = (
  id: string,
  lengthMin: number | null,
  atTime: string | null = null,
): ReflowItem => ({
  id,
  lengthMin,
  atTime,
});

describe("C2: reflowItems lays items around pinned times, never splitting one", () => {
  it("lays items from the block's start in order", () => {
    const flow = reflowItems({
      startsAt: "07:05",
      endsAt: "08:00",
      items: [item("pee", 5), item("water", 5), item("bath", 20)],
      bands: [],
    });
    expect(flow.placed).toEqual([
      { id: "pee", startsAt: "07:05" },
      { id: "water", startsAt: "07:10" },
      { id: "bath", startsAt: "07:15" },
    ]);
    expect(flow.overMin).toBe(0);
    expect(flow.freeFrom).toBe("07:35");
  });

  it("counts a null length as 5 minutes", () => {
    const flow = reflowItems({
      startsAt: "07:05",
      endsAt: "08:00",
      items: [item("new", null), item("next", 10)],
      bands: [],
    });
    expect(flow.placed[1]).toEqual({ id: "next", startsAt: "07:10" });
  });

  it("keeps a set-time item at its time and moves one that would cross it after it whole", () => {
    const flow = reflowItems({
      startsAt: "09:00",
      endsAt: "11:00",
      items: [item("a", 20), item("walk", 15, "09:30"), item("b", 30)],
      bands: [],
    });
    expect(flow.placed).toEqual([
      { id: "a", startsAt: "09:00" },
      { id: "walk", startsAt: "09:30" },
      { id: "b", startsAt: "09:45" },
    ]);
  });

  it("moves an item that would cross a set-time item listed later after it whole", () => {
    const flow = reflowItems({
      startsAt: "09:00",
      endsAt: "11:00",
      items: [item("long", 45), item("transition", 10, "09:20")],
      bands: [],
    });
    expect(flow.placed).toEqual([
      { id: "long", startsAt: "09:30" },
      { id: "transition", startsAt: "09:20" },
    ]);
  });

  it("keeps an event band at its time and moves the item after it whole", () => {
    const flow = reflowItems({
      startsAt: "09:30",
      endsAt: "12:00",
      items: [item("spec", 90), item("handoff", 30)],
      bands: [{ startsAt: "11:00", endsAt: "11:30" }],
    });
    expect(flow.placed).toEqual([
      { id: "spec", startsAt: "09:30" },
      { id: "handoff", startsAt: "11:30" },
    ]);
    expect(flow.freeFrom).toBeNull();
  });

  it("reports the minutes past the block's end", () => {
    const flow = reflowItems({
      startsAt: "17:30",
      endsAt: "19:00",
      items: [item("shop", 60), item("post", 45)],
      bands: [],
    });
    expect(flow.overMin).toBe(15);
    expect(flow.freeFrom).toBeNull();
  });

  it("starts free time after a band that covers the last item's end", () => {
    const flow = reflowItems({
      startsAt: "09:30",
      endsAt: "12:00",
      items: [item("spec", 90)],
      bands: [{ startsAt: "11:00", endsAt: "11:30" }],
    });
    expect(flow.freeFrom).toBe("11:30");
  });

  it("frees the whole block when it holds nothing", () => {
    const flow = reflowItems({
      startsAt: "09:30",
      endsAt: "12:00",
      items: [],
      bands: [],
    });
    expect(flow).toEqual({ placed: [], overMin: 0, freeFrom: "09:30" });
  });
});

describe("C3: eventLanding names the block an event falls in and what moves", () => {
  const work = {
    id: "work",
    name: "Work",
    startsAt: "09:30",
    endsAt: "12:00",
    items: [item("sync-spec", 90), item("paper-handoff", 30)],
  };
  const errands = {
    id: "errands",
    name: "Errands",
    startsAt: "17:30",
    endsAt: "19:00",
    items: [item("shop", 30)],
  };

  it("moves Review the Paper handoff to 11:30 for Design review at 11:00", () => {
    const landing = eventLanding({
      event: { startsAt: "11:00", endsAt: "11:30" },
      blocks: [errands, work],
    });
    expect(landing.inside).toEqual({ id: "work", name: "Work" });
    expect(landing.moves).toEqual([
      { id: "paper-handoff", from: "11:00", to: "11:30" },
    ]);
  });

  it("names the block and moves nothing when the event sits in free time", () => {
    const landing = eventLanding({
      event: { startsAt: "18:15", endsAt: "18:45" },
      blocks: [errands, work],
    });
    expect(landing).toEqual({
      inside: { id: "errands", name: "Errands" },
      moves: [],
    });
  });

  it("names none when the event falls between blocks", () => {
    expect(
      eventLanding({
        event: { startsAt: "14:00", endsAt: "15:00" },
        blocks: [errands, work],
      }),
    ).toEqual({ inside: null, moves: [] });
  });
});
