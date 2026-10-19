import { describe, expect, it } from "vitest";
import {
  joinClock,
  parseTypedClock,
  PICKER_HOURS,
  pickerKeyMove,
  pickerMinutes,
  pickerTypeAhead,
  splitClock,
} from "./time-picker";

// USE-141 C1: the 24-hour picker's lists answer the keyboard (time-picker.md).

describe("the lists", () => {
  it("has hours 0 to 23 and minutes in steps of 5", () => {
    expect(PICKER_HOURS).toHaveLength(24);
    expect(PICKER_HOURS.at(-1)).toBe(23);
    expect(pickerMinutes()).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    expect(pickerMinutes(15)).toEqual([0, 15, 30, 45]);
  });

  it("splits and joins the HH:mm a field carries; a typed minute is kept", () => {
    expect(splitClock("07:03")).toEqual({ hour: 7, minute: 3 });
    expect(joinClock(7, 3)).toBe("07:03");
    expect(splitClock("24:00")).toBeNull();
    expect(splitClock(null)).toBeNull();
  });
});

describe("keys (C1; C-USE-set-my-days-time-picker-3)", () => {
  it("moves by one with the arrows and stops at the ends", () => {
    expect(pickerKeyMove(6, 24, "ArrowDown")).toBe(7);
    expect(pickerKeyMove(6, 24, "ArrowUp")).toBe(5);
    expect(pickerKeyMove(23, 24, "ArrowDown")).toBe(23);
    expect(pickerKeyMove(0, 24, "ArrowUp")).toBe(0);
  });

  it("moves by five with Page Up and Down; Home and End go to the ends", () => {
    expect(pickerKeyMove(6, 24, "PageDown")).toBe(11);
    expect(pickerKeyMove(3, 24, "PageUp")).toBe(0);
    expect(pickerKeyMove(6, 24, "Home")).toBe(0);
    expect(pickerKeyMove(6, 12, "End")).toBe(11);
  });

  it("starts from the top or the end with no pick yet (a typed 7:03)", () => {
    expect(pickerKeyMove(null, 12, "ArrowDown")).toBe(0);
    expect(pickerKeyMove(null, 12, "ArrowUp")).toBe(11);
    expect(pickerKeyMove(6, 24, "Enter")).toBeNull();
  });

  it("types ahead by digits", () => {
    expect(pickerTypeAhead(PICKER_HOURS, "17")).toBe(17);
    expect(pickerTypeAhead(PICKER_HOURS, "6")).toBe(6);
    expect(pickerTypeAhead(pickerMinutes(), "3")).toBe(6);
    expect(pickerTypeAhead(pickerMinutes(), "45")).toBe(9);
    expect(pickerTypeAhead(pickerMinutes(), "x")).toBeNull();
  });
});

describe("typing in the field (C-USE-set-my-days-time-picker-5)", () => {
  it("reads what a person types and keeps any minute", () => {
    expect(parseTypedClock("6:30")).toBe("06:30");
    expect(parseTypedClock("7:03")).toBe("07:03");
    expect(parseTypedClock("0630")).toBe("06:30");
    expect(parseTypedClock("630")).toBe("06:30");
    expect(parseTypedClock("6")).toBe("06:00");
    expect(parseTypedClock("18.15")).toBe("18:15");
    expect(parseTypedClock("25:00")).toBeNull();
    expect(parseTypedClock("soon")).toBeNull();
  });
});

