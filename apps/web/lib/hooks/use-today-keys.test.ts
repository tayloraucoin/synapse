import { describe, expect, it } from "vitest";
import {
  todayKeyAction,
  type TodayKeyContext,
  type TodayKeyRow,
} from "./use-today-keys";

// USE-71 C1: the desk's key map on Today (D-USE-62).
const rows: TodayKeyRow[] = [
  { key: "primary-1", kind: "work", firing: false, done: false },
  { key: "primary-2", kind: "work", firing: true, done: false },
  { key: "secondary-1", kind: "work", firing: false, done: true },
  { key: "todo-1", kind: "todo", firing: false, done: false },
  { key: "todo-2", kind: "todo", firing: false, done: false },
];

const at = (
  focusedRow: string | null,
  more: Partial<TodayKeyContext> = {},
): TodayKeyContext => ({
  rows,
  focusedRow,
  inField: false,
  menuOpen: false,
  sheetOpen: false,
  planning: false,
  ...more,
});

describe("todayKeyAction", () => {
  it("F fires an idle row and brings a firing one back", () => {
    expect(todayKeyAction({ key: "f" }, at("primary-1"))).toEqual({
      type: "fire",
      key: "primary-1",
    });
    expect(todayKeyAction({ key: "F" }, at("primary-2"))).toEqual({
      type: "bring-back",
      key: "primary-2",
    });
  });

  it("F and D do nothing on a done row, a To-do or no row", () => {
    for (const key of ["f", "d"]) {
      expect(todayKeyAction({ key }, at("secondary-1"))).toBeNull();
      expect(todayKeyAction({ key }, at("todo-1"))).toBeNull();
      expect(todayKeyAction({ key }, at(null))).toBeNull();
    }
  });

  it("D is Done on the focused row, firing or not", () => {
    expect(todayKeyAction({ key: "d" }, at("primary-1"))).toEqual({
      type: "done",
      key: "primary-1",
    });
    expect(todayKeyAction({ key: "d" }, at("primary-2"))).toEqual({
      type: "done",
      key: "primary-2",
    });
  });

  it("J and K walk the tiers then the To-dos, done rows included", () => {
    const walk: string[] = [];
    let focused: string | null = null;
    for (let i = 0; i < rows.length; i++) {
      const action = todayKeyAction({ key: "j" }, at(focused));
      expect(action?.type).toBe("focus");
      focused = action?.type === "focus" ? action.key : null;
      walk.push(focused!);
    }
    expect(walk).toEqual(rows.map((row) => row.key));
    expect(todayKeyAction({ key: "k" }, at("todo-1"))).toEqual({
      type: "focus",
      key: "secondary-1",
    });
  });

  it("J past the last To-do and K above the first row stay put", () => {
    expect(todayKeyAction({ key: "j" }, at("todo-2"))).toBeNull();
    expect(todayKeyAction({ key: "k" }, at("primary-1"))).toBeNull();
  });

  it("J or K from no row goes to the first row", () => {
    expect(todayKeyAction({ key: "j" }, at(null))).toEqual({
      type: "focus",
      key: "primary-1",
    });
    expect(todayKeyAction({ key: "k" }, at(null))).toEqual({
      type: "focus",
      key: "primary-1",
    });
  });

  it("Enter goes to Next, unless focus is on a control of its own", () => {
    expect(todayKeyAction({ key: "Enter" }, at(null))).toEqual({
      type: "next",
    });
    expect(
      todayKeyAction({ key: "Enter" }, at("primary-1", { onControl: true })),
    ).toBeNull();
  });

  it("nothing acts in a field, an open menu, a sheet or on a planning day", () => {
    const blocked: Partial<TodayKeyContext>[] = [
      { inField: true },
      { menuOpen: true },
      { sheetOpen: true },
      { planning: true },
    ];
    for (const more of blocked) {
      for (const key of ["f", "d", "j", "k", "Enter"]) {
        expect(todayKeyAction({ key }, at("primary-1", more))).toBeNull();
      }
    }
  });

  it("a modifier leaves the key to the browser", () => {
    expect(
      todayKeyAction({ key: "f", metaKey: true }, at("primary-1")),
    ).toBeNull();
    expect(
      todayKeyAction({ key: "d", ctrlKey: true }, at("primary-1")),
    ).toBeNull();
    expect(
      todayKeyAction({ key: "j", altKey: true }, at("primary-1")),
    ).toBeNull();
  });

  it("other keys do nothing", () => {
    expect(todayKeyAction({ key: "x" }, at("primary-1"))).toBeNull();
    expect(todayKeyAction({ key: " " }, at("primary-1"))).toBeNull();
  });
});
