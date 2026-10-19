import { describe, expect, it } from "vitest";
import { countSessions, nextSession, type SessionSlot } from "./sessions";

const s = (
  id: string,
  onDate: string | null,
  doneAt: string | null = null,
  workItemId = "task",
): SessionSlot => ({ id, workItemId, onDate, doneAt });

// Array order is not date order.
const SLOTS = [
  s("thu", "2026-10-15"),
  s("mon", "2026-10-12"),
  s("wed", "2026-10-14"),
  s("other", "2026-10-13", null, "else"),
  s("pool", null),
];

describe("C5: sessions are numbered by date, the next is the first undone after a date, and Done never closes the task", () => {
  it("numbers one item's sessions by date as n of m", () => {
    const counted = countSessions(SLOTS);
    expect(counted.get("mon")).toEqual({ n: 1, of: 3 });
    expect(counted.get("wed")).toEqual({ n: 2, of: 3 });
    expect(counted.get("thu")).toEqual({ n: 3, of: 3 });
    expect(counted.get("other")).toEqual({ n: 1, of: 1 });
  });

  it("leaves an unplaced slot uncounted", () => {
    expect(countSessions(SLOTS).has("pool")).toBe(false);
  });

  it("names the next undone session after a date", () => {
    expect(nextSession(SLOTS, "task", "2026-10-12")).toBe("wed");
    const wedDone = SLOTS.map((x) =>
      x.id === "wed" ? { ...x, doneAt: "2026-10-14T15:00:00Z" } : x,
    );
    expect(nextSession(wedDone, "task", "2026-10-12")).toBe("thu");
  });

  it("names none after the last session; the task stays as it was", () => {
    const allDone = SLOTS.map((x) => ({
      ...x,
      doneAt: "2026-10-15T15:00:00Z",
    }));
    expect(nextSession(allDone, "task", "2026-10-12")).toBeNull();
    expect(nextSession(SLOTS, "task", "2026-10-15")).toBeNull();
    // Counting reads doneAt for nothing: a done session keeps its number.
    expect(countSessions(allDone).get("thu")).toEqual({ n: 3, of: 3 });
  });

  it("never reads another item's sessions", () => {
    expect(nextSession(SLOTS, "else", "2026-10-12")).toBe("other");
    expect(nextSession(SLOTS, "missing", "2026-10-01")).toBeNull();
  });
});
