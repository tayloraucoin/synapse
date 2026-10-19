import { describe, expect, it } from "vitest";
import { resolveDayEntry } from "./day-entry";

const AT = "2026-10-12T06:58:00-04:00";
const record = (
  orientedAt: string | null,
  readyAt: string | null = null,
  closedAt: string | null = null,
) => ({ orientedAt, readyAt, closedAt });

describe("C8: resolveDayEntry sends each day to its one screen", () => {
  it("sends a day with no record, or not yet oriented, to Orient", () => {
    expect(resolveDayEntry({ dayRecord: null, startedOnDevice: false })).toBe(
      "orient",
    );
    expect(
      resolveDayEntry({ dayRecord: record(null), startedOnDevice: false }),
    ).toBe("orient");
  });

  it("sends a day oriented before Ready, go to Review the day", () => {
    expect(
      resolveDayEntry({ dayRecord: record(AT), startedOnDevice: false }),
    ).toBe("review");
    // Start is only reached after Ready, go; a stray flag changes nothing.
    expect(
      resolveDayEntry({ dayRecord: record(AT), startedOnDevice: true }),
    ).toBe("review");
  });

  it("sends a day after Ready, go and before Start to the welcome", () => {
    expect(
      resolveDayEntry({ dayRecord: record(AT, AT), startedOnDevice: false }),
    ).toBe("welcome");
  });

  it("sends a day after Start to Now", () => {
    expect(
      resolveDayEntry({ dayRecord: record(AT, AT), startedOnDevice: true }),
    ).toBe("now");
  });

  it("sends a closed day to Now, never Orient", () => {
    expect(
      resolveDayEntry({
        dayRecord: record(null, null, AT),
        startedOnDevice: false,
      }),
    ).toBe("now");
    expect(
      resolveDayEntry({
        dayRecord: record(AT, AT, AT),
        startedOnDevice: false,
      }),
    ).toBe("now");
  });
});
