import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * USE-94 C4: `slot_events` is insert-only. No file under `services/clock`
 * updates or deletes a row, in Drizzle or in SQL, and the one insert drops
 * a stored client event id rather than overwriting it.
 */

const DIR = import.meta.dirname;

const sources = readdirSync(DIR)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
  .map((name) => ({ name, text: readFileSync(join(DIR, name), "utf8") }));

const FORBIDDEN = [
  /\.update\s*\(/,
  /\.delete\s*\(/,
  /onConflictDoUpdate/,
  /\bupdate\s+(public\.)?slot_events\b/i,
  /\bdelete\s+from\s+(public\.)?slot_events\b/i,
  /\btruncate\b/i,
];

describe("services/clock is append-only (C-USE-94-4)", () => {
  it("has its sources to read", () => {
    expect(sources.map((s) => s.name)).toEqual(
      expect.arrayContaining(["event-store.ts", "write-events.ts"]),
    );
  });

  it.each(FORBIDDEN)("no source matches %s", (pattern) => {
    for (const { name, text } of sources) {
      expect(pattern.test(text), name).toBe(false);
    }
  });

  it("inserts with ON CONFLICT DO NOTHING on the per-user key", () => {
    const store = sources.find((s) => s.name === "event-store.ts")!.text;
    expect(store).toMatch(
      /onConflictDoNothing\(\{\s*target: \[slotEvents\.userId, slotEvents\.clientEventId\]/,
    );
  });
});
