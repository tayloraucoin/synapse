import { describe, expect, it } from "vitest";
import { dayWindow } from "../day";
import { checkEventTime, EVENT_AHEAD_LIMIT_MS } from "./event-time";

const WINDOW = dayWindow("2026-10-13", "America/Toronto", "03:00");
const MIN = 60_000;

function after(base: Date, ms: number): Date {
  return new Date(base.getTime() + ms);
}

describe("C7: checkEventTime", () => {
  const serverNow = after(WINDOW.start, 8 * 60 * MIN);

  it("passes an at inside its slot's day, up to two minutes past the server's now", () => {
    for (const at of [
      WINDOW.start,
      after(serverNow, -30 * MIN),
      serverNow,
      after(serverNow, EVENT_AHEAD_LIMIT_MS),
    ])
      expect(
        checkEventTime({ at: at.toISOString(), dayWindow: WINDOW, serverNow }),
      ).toEqual({ ok: true });
  });

  it("refuses an at before the day opens", () => {
    expect(
      checkEventTime({
        at: after(WINDOW.start, -1).toISOString(),
        dayWindow: WINDOW,
        serverNow,
      }),
    ).toEqual({ ok: false, reason: "before-day" });
  });

  it("refuses an at at or after the day's close", () => {
    const lateNow = after(WINDOW.end, 60 * MIN);
    expect(
      checkEventTime({
        at: WINDOW.end.toISOString(),
        dayWindow: WINDOW,
        serverNow: lateNow,
      }),
    ).toEqual({ ok: false, reason: "after-day" });
  });

  it("refuses an at more than two minutes ahead of the server", () => {
    expect(
      checkEventTime({
        at: after(serverNow, EVENT_AHEAD_LIMIT_MS + 1).toISOString(),
        dayWindow: WINDOW,
        serverNow,
      }),
    ).toEqual({ ok: false, reason: "ahead-of-now" });
  });

  it("passes a replay received hours later", () => {
    const at = after(WINDOW.start, 60 * MIN);
    expect(
      checkEventTime({
        at: at.toISOString(),
        dayWindow: WINDOW,
        serverNow: after(WINDOW.end, 5 * 60 * MIN),
      }),
    ).toEqual({ ok: true });
  });
});
