import { describe, expect, it } from "vitest";
import {
  statusEffect,
  statusFill,
  type LinearStateLike,
} from "./linear-status";

const st = (
  id: string,
  name: string,
  type: string,
  position: number,
  teamId = "lh",
): LinearStateLike => ({ id, name, type, position, teamId });

// Lighthouse's workflow, out of position order on purpose.
const LIGHTHOUSE = [
  st("review", "In review", "started", 4),
  st("backlog", "Backlog", "backlog", 0),
  st("todo", "Todo", "unstarted", 0),
  st("blocked", "Blocked", "unstarted", 1),
  st("changes", "Changes requested", "started", 5),
  st("progress", "In progress", "started", 1),
  st("paused", "Paused", "started", 3),
  st("ongoing", "Ongoing", "started", 2),
  st("done", "Done", "completed", 0),
  st("canceled", "Canceled", "canceled", 0),
  st("duplicate", "Duplicate", "duplicate", 1),
  st("triage", "Triage", "triage", 0),
];

// Another team's started group never shares the denominator.
const OTHER = [
  st("o-doing", "Doing", "started", 0, "other"),
  st("o-qa", "QA", "started", 0.5, "other"),
];

const ALL = [...OTHER, ...LIGHTHOUSE];
const get = (id: string) => ALL.find((s) => s.id === id) as LinearStateLike;

describe("C4: a started status fills by its place in its team's group, ordered by position; completed fills; the rest are empty", () => {
  it.each([
    ["progress", 1 / 6],
    ["ongoing", 2 / 6],
    ["paused", 3 / 6],
    ["review", 4 / 6],
    ["changes", 5 / 6],
    ["o-doing", 1 / 3],
    ["o-qa", 2 / 3],
    ["done", 1],
    ["backlog", 0],
    ["todo", 0],
    ["blocked", 0],
    ["canceled", 0],
    ["duplicate", 0],
    ["triage", 0],
  ])("%s fills %d", (id, fill) => {
    expect(statusFill(get(id), ALL)).toBeCloseTo(fill, 10);
  });

  it("counts a state missing from the list once, and gives one answer for any input", () => {
    const lone = st("solo", "Solo", "started", 1, "nobody");
    expect(statusFill(lone, [])).toBe(1 / 2);
    const tied = [st("b", "B", "started", 1), st("a", "A", "started", 1)];
    expect(statusFill(tied[1]!, tied)).toBe(1 / 3);
    expect(statusFill(tied[0]!, [...tied].reverse())).toBe(2 / 3);
    const odd = st("nan", "NaN", "started", Number.NaN);
    expect(statusFill(odd, [odd, st("x", "X", "started", 9)])).toBe(2 / 3);
  });
});

describe("C5: what each status does here", () => {
  it.each([
    ["done", "check"],
    ["canceled", "off_today"],
    ["duplicate", "off_today"],
    ["blocked", "waiting"],
    ["paused", "waiting"],
    ["review", "waiting"],
    ["ongoing", "to_pool"],
    ["progress", "start"],
    ["o-doing", "start"],
    ["o-qa", "none"],
    ["changes", "none"],
    ["todo", "none"],
    ["backlog", "none"],
    ["triage", "none"],
  ])("%s reads as %s", (id, effect) => {
    expect(statusEffect(get(id), ALL)).toBe(effect);
  });

  it("matches the names as drawn, whatever their case or spacing, and needs no name", () => {
    expect(statusEffect(st("x", " in Review ", "started", 9), ALL)).toBe(
      "waiting",
    );
    expect(
      statusEffect(
        { id: "y", type: "unstarted", position: 0, teamId: "lh" },
        ALL,
      ),
    ).toBe("none");
  });
});
