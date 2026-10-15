import { describe, expect, it } from "vitest";
import { welcomeView, type WelcomeBlock } from "./welcome";

const block = (
  id: string,
  name: string,
  kind: string,
  startsAt: string,
  endsAt: string,
  checklist = false,
): WelcomeBlock => ({ id, name, kind, startsAt, endsAt, checklist });

const MONDAY = [
  block("w", "Wellness", "wellness", "07:05", "08:00"),
  block("t", "Training", "training", "08:00", "08:57"),
  block("b", "Breakfast", "break", "09:00", "09:30"),
  block("k", "Work", "work", "09:30", "12:00"),
  block("l", "Lunch", "break", "12:00", "13:00"),
  block("k2", "Work", "work", "13:00", "15:00"),
];

const LINE = "Slow start, cold bath, then one real push.";

describe("welcomeView (C7)", () => {
  it("the welcome at 7:02: First, three next blocks, Start Wellness early", () => {
    const view = welcomeView({
      occurrences: MONDAY,
      now: "07:02",
      linesToday: LINE,
      firstEver: false,
      isChecklistDay: false,
    });
    expect(view.heading).toBe("first");
    expect(view.rows.map((row) => row.name)).toEqual([
      "Wellness",
      "Training",
      "Breakfast",
    ]);
    expect(view.rows[0]).toMatchObject({ lead: true, underWay: false });
    expect(view.start).toMatchObject({ name: "Wellness", form: "early" });
    expect(view.orientLine).toBe(LINE);
    expect(view.teaching).toBe(false);
    expect(view.bar).toMatchObject({ from: 7 * 60, to: 17 * 60, nowMin: 422 });
    expect(view.bar.segments.every((segment) => !segment.faded)).toBe(true);
    expect(view.bar.segments.map((segment) => segment.initial)).toEqual([
      "W",
      "T",
      "B",
      "W",
      "L",
      "W",
    ]);
  });

  it("no Orient section when the line is empty", () => {
    const view = welcomeView({
      occurrences: MONDAY,
      now: "07:02",
      linesToday: "  ",
      firstEver: false,
      isChecklistDay: false,
    });
    expect(view.orientLine).toBeNull();
  });

  it("the first go ever: the teaching in place of the line, two rows", () => {
    const view = welcomeView({
      occurrences: MONDAY,
      now: "07:02",
      linesToday: LINE,
      firstEver: true,
      isChecklistDay: false,
    });
    expect(view.teaching).toBe(true);
    expect(view.orientLine).toBeNull();
    expect(view.rows).toHaveLength(2);
  });

  it("a late wake at 8:22: Now, Training under way, Wellness faded", () => {
    const moved = MONDAY.map((row) =>
      row.id === "t" ? { ...row, startsAt: "08:15" } : row,
    );
    const view = welcomeView({
      occurrences: moved,
      layout: { folded: ["w"], underWay: "t" },
      now: "08:22",
      linesToday: LINE,
      firstEver: false,
      isChecklistDay: false,
    });
    expect(view.heading).toBe("now");
    expect(view.rows.map((row) => row.name)).toEqual([
      "Training",
      "Breakfast",
      "Work",
    ]);
    expect(view.rows[0]).toMatchObject({ underWay: true, endsAt: "08:57" });
    expect(view.start).toMatchObject({
      name: "Training",
      startsAt: "08:15",
      form: "under-way",
    });
    const faded = view.bar.segments.filter((segment) => segment.faded);
    expect(faded.map((segment) => segment.blockId)).toEqual(["w"]);
  });

  it("derives the late wake from the minute when no layout is given", () => {
    const view = welcomeView({
      occurrences: MONDAY,
      now: "08:22",
      linesToday: null,
      firstEver: false,
      isChecklistDay: false,
    });
    expect(view.heading).toBe("now");
    expect(view.start?.name).toBe("Training");
  });

  it("a checklist day: the list all day, then Lunch with Sam, Open the list", () => {
    const view = welcomeView({
      occurrences: [
        block("s", "Sunday", "wellness", "00:00", "24:00", true),
        block("sam", "Lunch with Sam", "life", "13:00", "14:30"),
      ],
      now: "09:40",
      linesToday: "Nothing to prove today.",
      firstEver: false,
      isChecklistDay: true,
    });
    expect(view.heading).toBe("first");
    expect(view.rows).toEqual([
      expect.objectContaining({ name: "Sunday's list", allDay: true }),
      expect.objectContaining({ name: "Lunch with Sam", allDay: false }),
    ]);
    expect(view.start).toMatchObject({ name: "Sunday's list", form: "list" });
    const list = view.bar.segments[0]!;
    expect([list.startMin, list.endMin]).toEqual([7 * 60, 17 * 60]);
  });
});
